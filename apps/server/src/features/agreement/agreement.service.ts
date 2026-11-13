import { AccountTypeEnum, CreditStatusEnum } from '@credit/contracts';
import type { DocumentStorage, Identity } from '@server/constant/interface';
import type { DatabaseTransaction } from '@server/constant/type';
import {
  AgreementConflict,
  AgreementForbidden,
  AgreementInvalid,
  AgreementNotFound,
} from '@server/features/agreement/agreement.error';
import { agreementRepository } from '@server/features/agreement/agreement.repository';
import { agreementSections } from '@server/features/agreement/agreement.template';
import {
  addAgreementMonths,
  rupiahInWords,
} from '@server/features/agreement/utils/agreement-format';
import { creditService } from '@server/features/credit/credit.service';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import { createDocumentStorage } from '@server/utils/document-storage';
import { renderTextPdf } from '@server/utils/pdf-document';
import { withTransaction } from '@server/utils/transaction';

async function reserveNumber(
  id: number,
  identity: Identity,
  tx: DatabaseTransaction,
) {
  if (identity.type !== AccountTypeEnum.Debitor) {
    throw new AgreementForbidden();
  }

  const row = await agreementRepository.lockCredit(id, tx);
  if (!row) {
    throw new AgreementNotFound();
  }
  if (row.debitorId !== identity.id || row.companySlug !== identity.slug) {
    throw new AgreementForbidden();
  }
  if (
    row.status !== CreditStatusEnum.Approved ||
    row.statusAdminApproval !== CreditStatusEnum.Approved ||
    !row.acknowledgment ||
    !row.bankName ||
    !row.bankBranch ||
    !row.bankAccountName ||
    !row.bankAccountNumber
  ) {
    throw new AgreementConflict('Konfirmasi kredit belum lengkap');
  }
  if (row.agreementNumber) {
    return row.agreementNumber;
  }
  const company =
    row.companyName?.toUpperCase().replace(/[^\p{L}\p{N}]/gu, '') ?? '';
  if (!company || !/^\d{4}-\d{2}$/.test(row.createdMonth)) {
    throw new AgreementInvalid(
      'Data perusahaan atau tanggal kredit tidak tersedia',
    );
  }
  const sequence = await agreementRepository.nextSequence(row.createdMonth, tx);
  if (sequence === null) {
    throw new Error('Gagal membuat nomor perjanjian');
  }
  const [year, month] = row.createdMonth.split('-');
  const number = `${String(sequence).padStart(2, '0')}/BPR-${company}/${month}/${year}`;
  if (number.length > 255) {
    throw new AgreementInvalid('Nomor perjanjian terlalu panjang');
  }
  await agreementRepository.saveNumber(id, number, tx);
  return number;
}

export function createAgreementService(
  storage: DocumentStorage = createDocumentStorage(),
  render = renderTextPdf,
) {
  return {
    rupiahInWords,
    addAgreementMonths,
    allocateNumber: (id: number, identity: Identity) =>
      withTransaction((tx) => reserveNumber(id, identity, tx)),
    async generate(id: number, identity: Identity) {
      let added: string | undefined;
      try {
        return await withTransaction(async (tx) => {
          const number = await reserveNumber(id, identity, tx);
          const row = await agreementRepository.lockCredit(id, tx);
          if (!row) {
            throw new AgreementNotFound();
          }
          if (row.docUrl && row.docStorageKey) {
            return { url: row.docUrl, number };
          }
          const bank = process.env.AGREEMENT_BANK_NAME;
          const bankAddress = process.env.AGREEMENT_BANK_ADDRESS;
          const representative = process.env.AGREEMENT_BANK_REPRESENTATIVE;
          if (!bank || !bankAddress || !representative) {
            throw new AgreementInvalid('Identitas bank belum dikonfigurasi');
          }
          if (
            !row.nama ||
            !row.noKtp ||
            !row.address ||
            !row.principal ||
            !row.installment ||
            !row.months ||
            !row.rate ||
            !row.acknowledgment ||
            !row.companyName
          ) {
            throw new AgreementInvalid('Data dokumen belum lengkap');
          }
          const lateFee = process.env.AGREEMENT_LATE_FEE_PERCENT ?? '0.2';
          if (!/^\d+(?:\.\d+)?$/.test(lateFee)) {
            throw new AgreementInvalid('Denda tidak valid');
          }
          const expenses = await agreementRepository.expenses(id, tx);
          if (
            expenses.some((item) => item.name === null || item.amount === null)
          ) {
            throw new AgreementInvalid('Snapshot biaya tidak lengkap');
          }
          const totals = creditReviewService.expenseTotals(
            Number(row.principal),
            row.insurance ?? 0,
            expenses.map((item) => ({
              expenseName: item.name ?? '',
              amount: item.amount ?? '',
            })),
          );
          const sections = agreementSections({
            number,
            bank,
            bankAddress,
            representative,
            customer: row.nama,
            identity: row.noKtp,
            address: row.address,
            company: row.companyName,
            date: row.acknowledgment,
            firstPayment: addAgreementMonths(row.acknowledgment, 1),
            maturity: addAgreementMonths(row.acknowledgment, row.months),
            principal: row.principal,
            principalWords: rupiahInWords(BigInt(row.principal)),
            months: row.months,
            installment: row.installment,
            monthlyRate: row.rate,
            lateFee,
            account: `${row.bankName}, ${row.bankBranch}, ${row.bankAccountName}, ${row.bankAccountNumber}`,
            expenses: [
              ...expenses.map(
                (item) => `${item.name ?? 'Biaya'}: Rp${item.amount ?? '0'}`,
              ),
              `Asuransi jiwa: Rp${row.insurance ?? 0}`,
              'Materai: Rp10000',
              'Tabungan tetap: Rp100000',
              `Jumlah biaya: Rp${totals.total}`,
              `Total diterima: Rp${totals.received}`,
            ],
          });
          const bytes = await render('Perjanjian Kredit', sections);
          added = `agreements/${id}/${crypto.randomUUID()}.pdf`;
          await storage.put(added, bytes);
          await agreementRepository.saveDocument(id, added, tx);
          return { url: `/api/credit/doc?id=${id}`, number };
        });
      } catch (error) {
        if (added) {
          await storage.remove(added).catch(() => undefined);
        }
        throw error;
      }
    },
    async download(id: number, identity: Identity) {
      await creditService.detail(id, identity);
      const row = await agreementRepository.document(id);
      if (!row?.key || !/^agreements\/\d+\/[a-f0-9-]{36}\.pdf$/.test(row.key)) {
        throw new AgreementNotFound();
      }
      const bytes = await storage.get(row.key);
      if (!bytes) {
        throw new AgreementNotFound();
      }
      return bytes;
    },
    async count(id: number, identity: Identity) {
      const row = await creditService.detail(id, identity);
      const month = `${row.credit.createdAt.getFullYear()}-${String(row.credit.createdAt.getMonth() + 1).padStart(2, '0')}`;
      return { count: await agreementRepository.count(month) };
    },
  };
}
export const agreementService = createAgreementService();
