import type { AnyRoute } from '@tanstack/react-router';
import { CreditAddPage } from '@web/features/credit/CreditAddPage';
import { CreditEditPage } from '@web/features/credit/CreditEditPage';
import { CreditPage } from '@web/features/credit/CreditPage';
import { CreditViewPage } from '@web/features/credit/CreditViewPage';
import { createCrudRoutes } from '@web/utils/create-crud-routes';
export function creditRoutes<T extends AnyRoute>(parent: T) {
  return createCrudRoutes(parent, {
    list: CreditPage,
    add: CreditAddPage,
    edit: CreditEditPage,
    view: CreditViewPage,
  });
}
