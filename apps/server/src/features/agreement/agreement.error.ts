import {
  Conflict,
  Forbidden,
  InvalidInput,
  NotFound,
} from '@server/utils/service-error';
export class AgreementConflict extends Conflict {}
export class AgreementForbidden extends Forbidden {}
export class AgreementInvalid extends InvalidInput {}
export class AgreementNotFound extends NotFound {}
