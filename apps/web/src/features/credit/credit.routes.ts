import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { CreditAddPage } from '@web/features/credit/CreditAddPage';
import { CreditEditPage } from '@web/features/credit/CreditEditPage';
import { CreditPage } from '@web/features/credit/CreditPage';
import { CreditThanksPage } from '@web/features/credit/CreditThanksPage';
import { CreditViewPage } from '@web/features/credit/CreditViewPage';
import { createCrudRoutes } from '@web/utils/create-crud-routes';
export function creditRoutes<T extends AnyRoute>(parent: T) {
  const thanks = createRoute({
    getParentRoute: () => parent,
    path: '$id/thanks',
    component: CreditThanksPage,
  });
  return createCrudRoutes(
    parent,
    {
      list: CreditPage,
      add: CreditAddPage,
      edit: CreditEditPage,
      view: CreditViewPage,
    },
    thanks,
  );
}
