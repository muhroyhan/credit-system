import {
  AgreementConflict,
  AgreementForbidden,
  AgreementInvalid,
  AgreementNotFound,
} from '@server/features/agreement/agreement.error';
import { createAgreementService } from '@server/features/agreement/agreement.service';
import { creditService } from '@server/features/credit/credit.service';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { actors } from '../setup/fixtures';
import { setCredit, withApplication } from './fixtures/credit';

const confirmed = {
  status: 'approved',
  statusAdminApproval: 'approved',
  debitorAcknowledgmentTimestamp: '2026-11-13',
  bankName: 'Bank',
  bankBranch: 'Jakarta',
  bankAccountName: 'Nasabah',
  bankAccountNumber: '001234',
};
afterEach(() => vi.unstubAllEnvs());

describe('AGREEMENT-I issuance preconditions', () => {
  it.each([
    'status',
    'statusAdminApproval',
    'debitorAcknowledgmentTimestamp',
    'bankName',
    'bankBranch',
    'bankAccountName',
    'bankAccountNumber',
  ] as const)(
    'rejects missing %s without consuming a number',
    async (field) => {
      await withApplication(async (id) => {
        await setCredit(id, { ...confirmed, [field]: null });
        await expect(
          createAgreementService().allocateNumber(id, actors.customer),
        ).rejects.toBeInstanceOf(AgreementConflict);
        expect(
          (await creditService.detail(id, actors.company)).credit
            .agreementNumber,
        ).toBeNull();
      });
    },
  );
  it.each(['admin', 'company', 'otherCustomer'] as const)(
    'denies issuance by %s',
    async (actor) => {
      await withApplication(async (id) => {
        await setCredit(id, confirmed);
        await expect(
          createAgreementService().allocateNumber(id, actors[actor]),
        ).rejects.toBeInstanceOf(AgreementForbidden);
      });
    },
  );
  it('does not reserve a number or write a file without bank configuration', async () => {
    await withApplication(async (id) => {
      await setCredit(id, confirmed);
      vi.stubEnv('AGREEMENT_BANK_NAME', '');
      const put = vi.fn(async () => {});
      const service = createAgreementService({
        put,
        get: async () => null,
        remove: async () => {},
      });
      await expect(
        service.generate(id, actors.customer),
      ).rejects.toBeInstanceOf(AgreementInvalid);
      expect(put).not.toHaveBeenCalled();
      expect(
        (await creditService.detail(id, actors.company)).credit.agreementNumber,
      ).toBeNull();
    });
  });
  it('rolls back the number when PDF rendering fails', async () => {
    await withApplication(async (id) => {
      await setCredit(id, confirmed);
      const put = vi.fn(async () => {});
      const service = createAgreementService(
        { put, get: async () => null, remove: async () => {} },
        async () => {
          throw new Error('synthetic render failure');
        },
      );
      await expect(service.generate(id, actors.customer)).rejects.toThrow(
        'synthetic render failure',
      );
      expect(put).not.toHaveBeenCalled();
      expect(
        (await creditService.detail(id, actors.company)).credit.agreementNumber,
      ).toBeNull();
    });
  });
  it('does not generate a PDF during download', async () => {
    await withApplication(async (id) => {
      const get = vi.fn(async () => null);
      const service = createAgreementService({
        get,
        put: async () => {},
        remove: async () => {},
      });
      await expect(
        service.download(id, actors.customer),
      ).rejects.toBeInstanceOf(AgreementNotFound);
      expect(get).not.toHaveBeenCalled();
    });
  });
});
