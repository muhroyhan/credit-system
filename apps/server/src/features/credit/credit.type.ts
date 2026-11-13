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

export type CreditCollectionInput = CreditChildInput<typeof creditCollection>;

export type CreditGuarantorInput = CreditChildInput<typeof creditGuarantor>;

export type CreditInsuranceInput = CreditChildInput<typeof creditInsurance>;

export type CreditPotonganInput = CreditChildInput<typeof creditPotongan>;

export type CreditSlikBmpkInput = CreditChildInput<typeof creditSlikBmpk>;

export type CreditSpouseInput = CreditChildInput<typeof creditSpouse>;

export type CreditChildTable =
  | typeof creditCollection
  | typeof creditGuarantor
  | typeof creditInsurance
  | typeof creditPotongan
  | typeof creditSlikBmpk
  | typeof creditSpouse;

export type CreditChildInput<T extends CreditChildTable> = Omit<
  T['$inferInsert'],
  'id' | 'creditId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;
