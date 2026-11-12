import type { EmployeeAccount } from '@credit/contracts';
import type { SchemaOf } from '@server/constant/type';
export interface EmployeeWrite extends Omit<EmployeeAccount, 'password'> {
  password?: string;
}
export type EmployeesRoutes<A, B, C, D, E, F> = SchemaOf<A> &
  SchemaOf<B> &
  SchemaOf<C> &
  SchemaOf<D> &
  SchemaOf<E> &
  SchemaOf<F>;
