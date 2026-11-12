import type { EmployeeAccount } from '@credit/contracts';
import type { SchemaOf } from '@server/constant/type';
export interface EmployeeWrite extends Omit<EmployeeAccount, 'password'> {
  password?: string;
}
export type EmployeesRoutes<A, B, C, D, E, F, G, H, I, J> = SchemaOf<A> &
  SchemaOf<B> &
  SchemaOf<C> &
  SchemaOf<D> &
  SchemaOf<E> &
  SchemaOf<F> &
  SchemaOf<G> &
  SchemaOf<H> &
  SchemaOf<I> &
  SchemaOf<J>;

export interface EmployeeDocumentInput {
  name: string;
  type: string;
  bytes: Uint8Array;
}
