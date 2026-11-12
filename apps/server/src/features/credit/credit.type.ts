import type {
  creditCollection,
  creditGuarantor,
  creditInsurance,
  creditPotongan,
  creditSlikBmpk,
  creditSpouse,
} from '@credit/database/schema';

export interface CreditRate {
  jangkaWaktuBulan: string;
  bungaPercentage: string;
}

export type CreditCollectionInput = Omit<
  typeof creditCollection.$inferInsert,
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type CreditGuarantorInput = Omit<
  typeof creditGuarantor.$inferInsert,
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type CreditInsuranceInput = Omit<
  typeof creditInsurance.$inferInsert,
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type CreditPotonganInput = Omit<
  typeof creditPotongan.$inferInsert,
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type CreditSlikBmpkInput = Omit<
  typeof creditSlikBmpk.$inferInsert,
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type CreditSpouseInput = Omit<
  typeof creditSpouse.$inferInsert,
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;
