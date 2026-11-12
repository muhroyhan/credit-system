import { CreditInvalid } from '@server/features/credit/credit.error';
import { creditRepository } from '@server/features/credit/credit.repository';
import type { CreditRate } from '@server/features/credit/credit.type';

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
  async simulateForDebitor(debitorId: number, amount: string, months: number) {
    const data = await creditRepository.simulationData(debitorId);
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
