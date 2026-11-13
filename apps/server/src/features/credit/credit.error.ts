import {
  Conflict,
  Forbidden,
  InvalidInput,
  NotFound,
} from '@server/utils/service-error';

export class CreditInvalid extends InvalidInput {}
export class CreditForbidden extends Forbidden {}
export class CreditNotFound extends NotFound {}
export class CreditConflict extends Conflict {}
