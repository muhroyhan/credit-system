import { Conflict, NotFound } from '@server/utils/service-error';

export class CompanyConflict extends Conflict {}
export class CompanyNotFound extends NotFound {}
