import { Conflict, NotFound } from '@server/utils/service-error';

export class AdminConflict extends Conflict {}
export class AdminNotFound extends NotFound {}
