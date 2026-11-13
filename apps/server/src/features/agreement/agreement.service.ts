import type { Identity } from '@server/constant/interface';
import {
  AgreementConflict,
  AgreementForbidden,
  AgreementInvalid,
  AgreementNotFound,
} from '@server/features/agreement/agreement.error';
import { agreementRepository } from '@server/features/agreement/agreement.repository';
import { withTransaction } from '@server/utils/transaction';
import { z } from 'zod';

const dateSchema = z.iso.date();
const words = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
] as const;

function triplet(value: number): string {
  if (value < 12) {
    return words[value] ?? '';
  }
  if (value < 20) {
    return `${triplet(value - 10)} belas`;
  }
  if (value < 100) {
    return `${triplet(Math.floor(value / 10))} puluh ${triplet(value % 10)}`.trim();
  }
  if (value < 200) {
    return `seratus ${triplet(value - 100)}`.trim();
  }
  return `${triplet(Math.floor(value / 100))} ratus ${triplet(value % 100)}`.trim();
}

/** Formats non-negative whole rupiah, preserving integer precision. */
export function rupiahInWords(amount: bigint): string {
  if (amount < 0n || amount >= 1_000_000_000_000_000n) {
    throw new RangeError('Nominal terbilang di luar batas');
  }
  if (amount === 0n) {
    return 'nol rupiah';
  }
  const groups = [1_000_000_000_000n, 1_000_000_000n, 1_000_000n, 1_000n, 1n];
  const labels = ['triliun', 'miliar', 'juta', 'ribu', ''];
  let remaining = amount;
  const result: string[] = [];
  groups.forEach((divisor, index) => {
    const count = Number(remaining / divisor);
    remaining %= divisor;
    if (count === 0) {
      return;
    }
    if (divisor === 1_000n && count === 1) {
      result.push('seribu');
      return;
    }
    result.push(`${triplet(count)} ${labels[index] ?? ''}`.trim());
  });
  return `${result.join(' ')} rupiah`;
}

/** Adds calendar months and clamps dates beyond the target month's last day. */
export function addAgreementMonths(date: string, months: number): string {
  if (
    !dateSchema.safeParse(date).success ||
    !Number.isSafeInteger(months) ||
    months < 0 ||
    months > 1200
  ) {
    throw new RangeError('Tanggal atau tenor tidak valid');
  }
  const [year = 0, month = 0, day = 0] = date.split('-').map(Number);
  const index = year * 12 + month - 1 + months;
  const targetYear = Math.floor(index / 12);
  if (targetYear > 9999) {
    throw new RangeError('Tanggal di luar batas');
  }
  const targetMonth = (index % 12) + 1;
  const last = new Date(0);
  last.setUTCFullYear(targetYear, targetMonth, 0);
  const lastDay = last.getUTCDate();
  return `${String(targetYear).padStart(4, '0')}-${String(targetMonth).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

export const agreementService = {
  rupiahInWords,
  addAgreementMonths,
  async allocateNumber(id: number, identity: Identity) {
    if (identity.type !== 'debitor') {
      throw new AgreementForbidden();
    }
    return withTransaction(async (tx) => {
      const row = await agreementRepository.lockCredit(id, tx);
      if (!row) {
        throw new AgreementNotFound();
      }
      if (row.debitorId !== identity.id || row.companySlug !== identity.slug) {
        throw new AgreementForbidden();
      }
      if (
        row.status !== 'approved' ||
        row.statusAdminApproval !== 'approved' ||
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
      const sequence = await agreementRepository.nextSequence(
        row.createdMonth,
        tx,
      );
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
    });
  },
};
