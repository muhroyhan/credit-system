import type {
  CreditApplication,
  CreditApproval,
  CreditConfirmation,
  CreditQuery,
} from '@credit/contracts';
import type { Identity } from '@server/constant/interface';
import type { DatabaseTransaction } from '@server/constant/type';
import { authService } from '@server/features/auth/auth.service';
import {
  CreditConflict,
  CreditForbidden,
  CreditInvalid,
  CreditNotFound,
} from '@server/features/credit/credit.error';
import { creditRepository } from '@server/features/credit/credit.repository';
import type { CreditRate } from '@server/features/credit/credit.type';
import { creditReviewRepository } from '@server/features/credit-review/credit-review.repository';
import { employeesRepository } from '@server/features/employees/employees.repository';
import { exportFile } from '@server/utils/export-file';
import { withTransaction } from '@server/utils/transaction';

function authorize(identity: Identity, action: 'READ' | 'CREATE' | 'UPDATE') {
  if (
    identity.type === 'admin' &&
    !authService.hasAclPermission(identity, `CGP_${action}`)
  ) {
    throw new CreditForbidden();
  }
}

async function companyScope(identity: Identity, tx?: DatabaseTransaction) {
  if (identity.type === 'admin') {
    return undefined;
  }
  const company = await employeesRepository.company(identity.slug, tx);
  if (!company) {
    throw new CreditForbidden();
  }
  return company.id;
}

async function requireDebitor(
  identity: Identity,
  debitorId: number,
  tx?: DatabaseTransaction,
) {
  const row = await employeesRepository.account(debitorId, tx);
  if (!row) {
    throw new CreditNotFound();
  }
  const companyId = await companyScope(identity, tx);
  if (
    (companyId !== undefined && companyId !== row.userId) ||
    (identity.type === 'debitor' && identity.id !== debitorId)
  ) {
    throw new CreditForbidden();
  }
}

function parseAmount(value: string) {
  const trimmed = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(trimmed)) {
    throw new CreditInvalid('Nominal tidak valid');
  }
  const amount = Number(trimmed.replaceAll('.', ''));
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new CreditInvalid('Nominal harus lebih dari nol');
  }
  return amount;
}

export const creditService = {
  parseAmount,
  async confirm(input: CreditConfirmation, identity: Identity) {
    if (identity.type !== 'debitor') {
      throw new CreditForbidden();
    }
    return withTransaction(async (tx) => {
      const row = await creditRepository.detail(input.id, tx);
      if (!row || row.credit.debitorId === null) {
        throw new CreditNotFound();
      }
      await requireDebitor(identity, row.credit.debitorId, tx);
      if (
        row.credit.status !== 'approved' ||
        row.credit.statusAdminApproval !== 'approved' ||
        row.credit.debitorAcknowledgmentTimestamp
      ) {
        throw new CreditConflict('Pengajuan tidak dapat dikonfirmasi');
      }
      if (!row.nama || input.confirmationName !== row.nama) {
        throw new CreditInvalid(
          'Nama konfirmasi harus sama dengan nama debitor',
        );
      }
      await creditRepository.confirm(
        input,
        `${identity.type}:${identity.id}`,
        tx,
      );
      return input.id;
    });
  },
  async status(id: number, identity: Identity) {
    if (identity.type !== 'debitor') {
      throw new CreditForbidden();
    }
    const row = await creditService.detail(id, identity);
    return { ...row, expenses: await creditReviewRepository.expenses(id) };
  },
  async cancel(id: number, identity: Identity) {
    if (identity.type !== 'debitor') {
      throw new CreditForbidden();
    }
    return withTransaction(async (tx) => {
      const row = await creditRepository.detail(id, tx);
      if (!row || row.credit.debitorId === null) {
        throw new CreditNotFound();
      }
      await requireDebitor(identity, row.credit.debitorId, tx);
      if (
        row.credit.status !== 'approved' ||
        row.credit.statusAdminApproval !== 'approved' ||
        row.credit.debitorAcknowledgmentTimestamp
      ) {
        throw new CreditConflict('Pengajuan tidak dapat dibatalkan');
      }
      await creditRepository.cancel(id, `${identity.type}:${identity.id}`, tx);
      return id;
    });
  },
  async approve(input: CreditApproval, identity: Identity) {
    if (identity.type !== 'company') {
      throw new CreditForbidden();
    }
    return withTransaction(async (tx) => {
      const debitorId = await creditRepository.debitorId(input.id, tx);
      if (debitorId === null) {
        throw new CreditNotFound();
      }
      await requireDebitor(identity, debitorId, tx);
      const row = await creditRepository.detail(input.id, tx);
      if (!row || row.credit.debitorId !== debitorId) {
        throw new CreditNotFound();
      }
      if (row.credit.status !== 'pending') {
        throw new CreditConflict('Pengajuan tidak dalam status pending');
      }
      await creditRepository.approve(
        input.id,
        input.status,
        `${identity.type}:${identity.id}`,
        tx,
      );
      return input.id;
    });
  },
  async rates(debitorId: number, identity: Identity) {
    authorize(identity, 'READ');
    await requireDebitor(identity, debitorId);
    const data = await creditRepository.simulationData(debitorId);
    if (!data) {
      throw new CreditNotFound();
    }
    return data.rates;
  },
  async exportFile(
    query: CreditQuery,
    identity: Identity,
    format: 'pdf' | 'xlsx',
  ) {
    authorize(identity, 'READ');
    const result = await creditRepository.list(
      query,
      await companyScope(identity),
      identity.type === 'debitor' ? identity.id : undefined,
      false,
    );
    return exportFile({
      title: 'Pengajuan Kredit',
      columns: ['ID', 'Nama', 'Perusahaan', 'Nominal', 'Tenor', 'Status'],
      values: result.data.map(({ credit, nama, companyName }) => [
        String(credit.id),
        nama ?? '',
        companyName ?? '',
        credit.jumlahPengajuan ?? '',
        String(credit.jangkaWaktuBulan ?? ''),
        credit.status ?? '',
      ]),
      format,
    });
  },
  async list(query: CreditQuery, identity: Identity) {
    authorize(identity, 'READ');
    const result = await creditRepository.list(
      query,
      await companyScope(identity),
      identity.type === 'debitor' ? identity.id : undefined,
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (row) => {
          const totalAngsuran =
            Number(row.credit.jumlahAngsuran ?? 0) *
            Number(row.credit.jangkaWaktuBulan ?? 0);
          if (identity.type !== 'admin' || row.credit.debitorId === null) {
            return { ...row, totalAngsuran };
          }
          const data = await creditRepository.simulationData(
            row.credit.debitorId,
          );
          if (
            !data ||
            data.income === null ||
            data.open.some((item) => item.amount === null)
          ) {
            return {
              ...row,
              totalAngsuran,
              sumPengajuan: null,
              creditScore: null,
            };
          }
          const summary = creditService.summary(
            data.income,
            data.open.map((item) => item.amount ?? ''),
          );
          return {
            ...row,
            totalAngsuran,
            sumPengajuan: summary.open,
            creditScore: summary.score,
          };
        }),
      ),
    };
  },
  async detail(id: number, identity: Identity) {
    authorize(identity, 'READ');
    const row = await creditRepository.detail(id);
    if (!row || row.credit.debitorId === null) {
      throw new CreditNotFound();
    }
    await requireDebitor(identity, row.credit.debitorId);
    return {
      ...row,
      children: await creditRepository.children(id),
      totalAngsuran:
        Number(row.credit.jumlahAngsuran ?? 0) *
        Number(row.credit.jangkaWaktuBulan ?? 0),
    };
  },
  async simulation(input: CreditApplication, identity: Identity) {
    authorize(identity, 'READ');
    await requireDebitor(identity, input.debitorId);
    return creditService.simulateForDebitor(
      input.debitorId,
      input.jumlahPengajuan,
      input.jangkaWaktuBulan,
    );
  },
  async save(input: CreditApplication, identity: Identity, id?: number) {
    authorize(identity, id === undefined ? 'CREATE' : 'UPDATE');
    return withTransaction(async (tx) => {
      await requireDebitor(identity, input.debitorId, tx);
      if (id !== undefined) {
        const old = await creditRepository.detail(id, tx);
        if (!old) {
          throw new CreditNotFound();
        }
        if (old.credit.debitorId !== input.debitorId) {
          throw new CreditForbidden();
        }
        if (
          old.credit.status === 'approved' ||
          old.credit.status === 'rejected'
        ) {
          throw new CreditConflict('Pengajuan sudah terkunci');
        }
      }
      const simulation = await creditService.simulateForDebitor(
        input.debitorId,
        input.jumlahPengajuan,
        input.jangkaWaktuBulan,
        tx,
      );
      const result = await creditRepository.save(
        input,
        simulation,
        `${identity.type}:${identity.id}`,
        tx,
        id,
      );
      if (result === undefined) {
        throw new CreditInvalid('Gagal menyimpan pengajuan');
      }
      const actor = `${identity.type}:${identity.id}`;
      if (input.collection) {
        await creditRepository.saveCollection(
          result,
          input.collection,
          actor,
          tx,
        );
      }
      if (input.guarantor) {
        await creditRepository.saveGuarantor(
          result,
          input.guarantor,
          actor,
          tx,
        );
      }
      if (input.slikBmpk) {
        await creditRepository.saveSlikBmpk(result, input.slikBmpk, actor, tx);
      }
      if (input.spouse) {
        await creditRepository.saveSpouse(result, input.spouse, actor, tx);
      }
      if (input.insurance) {
        await creditRepository.saveInsurance(
          result,
          input.insurance,
          actor,
          tx,
        );
      }
      return result;
    });
  },
  async simulateForDebitor(
    debitorId: number,
    amount: string,
    months: number,
    tx?: DatabaseTransaction,
  ) {
    const data = await creditRepository.simulationData(debitorId, tx);
    if (
      !data ||
      data.income === null ||
      data.open.some((row) => row.amount === null)
    ) {
      throw new CreditInvalid('Data penghasilan atau pengajuan tidak tersedia');
    }
    const rates = data.rates.flatMap((rate) =>
      rate.jangkaWaktuBulan === null || rate.bungaPercentage === null
        ? []
        : [
            {
              jangkaWaktuBulan: rate.jangkaWaktuBulan,
              bungaPercentage: rate.bungaPercentage,
            },
          ],
    );
    const summary = creditService.summary(
      data.income,
      data.open.map((row) => row.amount ?? ''),
    );
    return { ...creditService.simulate(amount, months, rates), ...summary };
  },
  simulate(amount: string, months: number, rates: CreditRate[]) {
    const principal = parseAmount(amount);
    if (!Number.isSafeInteger(months) || months <= 0) {
      throw new CreditInvalid('Tenor tidak valid');
    }
    if (principal < 8_000_000 && months > 12) {
      throw new CreditInvalid('Tenor maksimal 12 bulan untuk nominal ini');
    }
    const rate = rates.find((item) => Number(item.jangkaWaktuBulan) === months);
    if (!rate || !/^\d+(?:\.\d+)?$/.test(rate.bungaPercentage.trim())) {
      throw new CreditInvalid('Bunga untuk tenor tidak tersedia');
    }
    const percentage = Number(rate.bungaPercentage);
    const installment = Math.round(
      (principal * percentage) / 100 + principal / months,
    );
    const total = installment * months;
    if (!Number.isSafeInteger(installment) || !Number.isSafeInteger(total)) {
      throw new CreditInvalid('Hasil perhitungan di luar batas');
    }
    return { principal, months, percentage, installment, total };
  },
  summary(income: number, openAmounts: string[]) {
    if (!Number.isSafeInteger(income) || income < 0) {
      throw new CreditInvalid('Pendapatan tidak valid');
    }
    const open = openAmounts.reduce(
      (sum, amount) => sum + parseAmount(amount),
      0,
    );
    if (!Number.isSafeInteger(open)) {
      throw new CreditInvalid('Jumlah pengajuan di luar batas');
    }
    return { open, score: income - open };
  },
};
