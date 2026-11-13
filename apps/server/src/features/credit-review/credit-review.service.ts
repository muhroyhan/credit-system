import type {
  CreditQuery,
  CreditReview,
  ExportTypeEnum,
} from '@credit/contracts';
import { AccountTypeEnum, CreditStatusEnum } from '@credit/contracts';
import type { Identity } from '@server/constant/interface';
import { authService } from '@server/features/auth/auth.service';
import {
  CreditConflict,
  CreditForbidden,
  CreditInvalid,
  CreditNotFound,
} from '@server/features/credit/credit.error';
import { creditRepository } from '@server/features/credit/credit.repository';
import { creditService } from '@server/features/credit/credit.service';
import { creditReviewRepository } from '@server/features/credit-review/credit-review.repository';
import type { CreditExpenseInput } from '@server/features/credit-review/credit-review.type';
import { employeesRepository } from '@server/features/employees/employees.repository';
import { createDocumentStorage } from '@server/utils/document-storage';
import { exportFile } from '@server/utils/export-file';
import { withTransaction } from '@server/utils/transaction';
import { createWhatsAppSender } from '@server/utils/whatsapp';
import { zipDocuments } from '@server/utils/zip-documents';

function decimalFromCents(value: bigint) {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}

export const creditReviewService = {
  async exportZip(query: CreditQuery, identity: Identity) {
    if (
      identity.type !== AccountTypeEnum.Admin ||
      !authService.hasAclPermission(identity, 'DKN_READ')
    ) {
      throw new CreditForbidden();
    }
    const result = await creditRepository.list(
      { ...query, status: query.status ?? 'approved' },
      undefined,
      undefined,
      false,
    );
    const entries = result.data
      .filter((row) => row.credit.docUrl)
      .map(({ credit, companyName }) => ({
        id: credit.id,
        debitorId: credit.debitorId,
        companyName,
        createdAt: credit.createdAt,
        key: credit.docStorageKey,
      }));
    const data = await zipDocuments(entries, createDocumentStorage());
    if (!data) {
      throw new CreditNotFound('Dokumen tidak tersedia');
    }
    return data;
  },

  async reviewList(query: CreditQuery, identity: Identity) {
    if (
      identity.type !== AccountTypeEnum.Admin ||
      !authService.hasAclPermission(identity, 'DKN_READ')
    ) {
      throw new CreditForbidden();
    }
    return creditRepository.list({
      ...query,
      status: query.status ?? 'approved',
    });
  },
  async exportReviews(
    query: CreditQuery,
    identity: Identity,
    format: ExportTypeEnum,
  ) {
    if (
      identity.type !== AccountTypeEnum.Admin ||
      !authService.hasAclPermission(identity, 'DKN_READ')
    ) {
      throw new CreditForbidden();
    }
    const result = await creditRepository.list(
      { ...query, status: query.status ?? 'approved' },
      undefined,
      undefined,
      false,
    );
    return exportFile({
      title: 'Daftar Kredit Karyawan',
      columns: [
        'ID',
        'Nama',
        'Perusahaan',
        'Nominal',
        'Tenor',
        'Status HRD',
        'Status BPR',
        'Bank',
        'Cabang',
        'Nama rekening',
        'Nomor rekening',
        'Tanggal pengajuan',
        'Tanggal konfirmasi',
      ],
      values: result.data.map(({ credit, nama, companyName }) => [
        String(credit.id),
        nama ?? '',
        companyName ?? '',
        credit.jumlahPengajuan ?? '',
        String(credit.jangkaWaktuBulan ?? ''),
        credit.status ?? '',
        credit.statusAdminApproval ?? '',
        credit.bankName ?? '',
        credit.bankBranch ?? '',
        credit.bankAccountName ?? '',
        credit.bankAccountNumber ?? '',
        credit.tanggalPengajuan ?? '',
        credit.debitorAcknowledgmentTimestamp ?? '',
      ]),
      format,
    });
  },
  async reviewDetail(id: number, identity: Identity) {
    if (
      identity.type !== AccountTypeEnum.Admin ||
      !authService.hasAclPermission(identity, 'DKN_READ')
    ) {
      throw new CreditForbidden();
    }
    const row = await creditRepository.detail(id);
    if (!row || row.credit.debitorId === null) {
      throw new CreditNotFound();
    }
    const simulation = await creditRepository.simulationData(
      row.credit.debitorId,
    );
    const summary =
      simulation?.income == null ||
      simulation.open.some((item) => item.amount === null)
        ? null
        : creditService.summary(
            simulation.income,
            simulation.open.map((item) => item.amount ?? ''),
          );
    return {
      ...row,
      expenses: await creditReviewRepository.expenses(id),
      summary,
    };
  },
  async review(input: CreditReview, identity: Identity) {
    if (
      identity.type !== AccountTypeEnum.Admin ||
      !authService.hasAclPermission(identity, 'DKN_APPROVAL')
    ) {
      throw new CreditForbidden();
    }
    const id = await withTransaction(async (tx) => {
      const debitorId = await creditRepository.debitorId(input.id, tx);
      if (debitorId === null) {
        throw new CreditNotFound();
      }
      if (!(await employeesRepository.account(debitorId, tx))) {
        throw new CreditNotFound();
      }
      const row = await creditRepository.detail(input.id, tx);
      if (!row || row.credit.debitorId !== debitorId || row.userId === null) {
        throw new CreditNotFound();
      }
      if (
        row.credit.status !== CreditStatusEnum.Approved ||
        row.credit.statusAdminApproval === CreditStatusEnum.Rejected ||
        row.credit.statusAdminApproval === CreditStatusEnum.Completed
      ) {
        throw new CreditConflict('Pengajuan tidak dapat ditinjau');
      }
      const changed =
        row.credit.jumlahPengajuan !==
          String(creditService.parseAmount(input.jumlahPengajuan)) ||
        row.credit.jangkaWaktuBulan !== input.jangkaWaktuBulan ||
        (row.credit.biayaAsuransiJiwa ?? 0) !== input.biayaAsuransiJiwa;
      if (changed && !authService.hasAclPermission(identity, 'DKN_UPDATE')) {
        throw new CreditForbidden();
      }
      if (
        row.credit.statusAdminApproval === CreditStatusEnum.Approved &&
        input.statusAdminApproval !== CreditStatusEnum.Completed
      ) {
        throw new CreditConflict('Pengajuan telah disetujui BPR');
      }
      if (
        row.credit.statusAdminApproval === CreditStatusEnum.Approved &&
        (row.credit.jumlahPengajuan !==
          String(creditService.parseAmount(input.jumlahPengajuan)) ||
          row.credit.jangkaWaktuBulan !== input.jangkaWaktuBulan ||
          row.credit.biayaAsuransiJiwa !== input.biayaAsuransiJiwa)
      ) {
        throw new CreditConflict('Data pengajuan telah terkunci');
      }
      const simulation = await creditService.simulateForDebitor(
        debitorId,
        input.jumlahPengajuan,
        input.jangkaWaktuBulan,
        tx,
      );
      const actor = `${identity.type}:${identity.id}`;
      if (input.statusAdminApproval === CreditStatusEnum.Approved) {
        const config = await creditReviewRepository.expenseConfiguration(
          row.userId,
          tx,
        );
        const calculated = creditReviewService.calculateExpenses(
          simulation.principal,
          simulation.installment,
          input.biayaAsuransiJiwa,
          config,
        );
        await creditReviewRepository.replaceExpenses(
          input.id,
          calculated.expenses,
          actor,
          tx,
        );
      }
      await creditReviewRepository.saveReview(
        input.id,
        input.statusAdminApproval,
        simulation.principal,
        input.jangkaWaktuBulan,
        simulation.percentage,
        simulation.installment,
        input.biayaAsuransiJiwa,
        actor,
        tx,
      );
      return input.id;
    });
    if (input.statusAdminApproval !== CreditStatusEnum.Approved) {
      return { id, notification: 'not-required' as const };
    }
    const {
      WHATSAPP_GRAPH_VERSION,
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_TEMPLATE_NAME,
      WHATSAPP_TEMPLATE_LANGUAGE,
      PUBLIC_APP_URL,
    } = process.env;
    if (
      !WHATSAPP_GRAPH_VERSION ||
      !WHATSAPP_PHONE_NUMBER_ID ||
      !WHATSAPP_ACCESS_TOKEN ||
      !WHATSAPP_TEMPLATE_NAME ||
      !WHATSAPP_TEMPLATE_LANGUAGE ||
      !PUBLIC_APP_URL
    ) {
      return { id, notification: 'not-configured' as const };
    }
    try {
      const recipient = await creditReviewRepository.notificationRecipient(id);
      if (!recipient) {
        throw new Error('Nomor penerima tidak tersedia');
      }
      const baseUrl = new URL(PUBLIC_APP_URL);
      if (baseUrl.protocol !== 'https:') {
        throw new Error('URL aplikasi harus HTTPS');
      }
      const sender = createWhatsAppSender({
        version: WHATSAPP_GRAPH_VERSION,
        phoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
        accessToken: WHATSAPP_ACCESS_TOKEN,
        templateName: WHATSAPP_TEMPLATE_NAME,
        language: WHATSAPP_TEMPLATE_LANGUAGE,
      });
      await sender.send({
        recipient,
        statusUrl: new URL(`/credits/${id}`, baseUrl).toString(),
      });
      return { id, notification: 'sent' as const };
    } catch {
      return { id, notification: 'failed' as const };
    }
  },
  expenseTotals(
    principal: number,
    insurance: number,
    expenses: Array<{ expenseName: string; amount: string }>,
  ) {
    if (
      !Number.isSafeInteger(principal) ||
      principal <= 0 ||
      !/^\d+(?:\.\d{1,2})?$/.test(String(insurance)) ||
      expenses.some((item) => !/^\d+\.\d{2}$/.test(item.amount))
    ) {
      throw new CreditInvalid('Nominal biaya tidak valid');
    }
    const [whole, fraction = ''] = String(insurance).split('.');
    const insuranceCents =
      BigInt(whole ?? '0') * 100n + BigInt(fraction.padEnd(2, '0') || '0');
    const totalCents =
      expenses
        .filter((item) => !item.expenseName.toLowerCase().includes('tabungan'))
        .reduce((sum, item) => sum + BigInt(item.amount.replace('.', '')), 0n) +
      insuranceCents +
      1000000n;
    return {
      total: decimalFromCents(totalCents),
      received: decimalFromCents(
        BigInt(principal) * 100n - totalCents - 10000000n,
      ),
    };
  },
  calculateExpenses(
    principal: number,
    installment: number,
    insurance: number,
    configuration: Array<{
      expenseName: string | null;
      unit: string | null;
      value: number | null;
    }>,
  ) {
    if (
      !Number.isSafeInteger(principal) ||
      principal <= 0 ||
      !Number.isSafeInteger(installment) ||
      installment < 0 ||
      !Number.isFinite(insurance) ||
      insurance < 0 ||
      !/^\d+(?:\.\d{1,2})?$/.test(String(insurance))
    ) {
      throw new CreditInvalid('Data perhitungan biaya tidak valid');
    }
    const expenses: CreditExpenseInput[] = configuration.map((item) => {
      if (
        item.expenseName === null ||
        item.unit === null ||
        item.value === null ||
        !Number.isSafeInteger(item.value) ||
        item.value < 0
      ) {
        throw new CreditInvalid('Konfigurasi biaya tidak lengkap');
      }
      const amountCents =
        item.unit === '%'
          ? BigInt(principal) * BigInt(item.value)
          : item.unit === 'x'
            ? BigInt(installment) * BigInt(item.value) * 100n
            : BigInt(item.value) * 100n;
      if (amountCents >= 10n ** 30n) {
        throw new CreditInvalid('Biaya melebihi batas penyimpanan');
      }
      return {
        expenseName: item.expenseName,
        unit: item.unit,
        value: item.value,
        amount: decimalFromCents(amountCents),
      };
    });
    return {
      expenses,
      ...creditReviewService.expenseTotals(principal, insurance, expenses),
    };
  },
};
