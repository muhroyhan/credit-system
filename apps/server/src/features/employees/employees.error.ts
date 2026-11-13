import {
  Conflict,
  Forbidden,
  InvalidInput,
  NotFound,
} from '@server/utils/service-error';

export class EmployeeConflict extends Conflict {}
export class EmployeeNotFound extends NotFound {}
export class EmployeeForbidden extends Forbidden {}

export class EmployeeInvalid extends InvalidInput {}
