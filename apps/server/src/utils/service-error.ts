/** Business failures raised by services; controllers determine HTTP responses. */
export class InvalidInput extends Error {}
export class Forbidden extends Error {}
export class NotFound extends Error {}
export class Conflict extends Error {}
