import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { CreditorReviewPage } from '@web/features/credit/CreditorReviewPage';
import { CreditorReviewViewPage } from '@web/features/credit/CreditorReviewViewPage';

export function creditReviewRoutes<T extends AnyRoute>(parent: T) {
  const list = createRoute({
    getParentRoute: () => parent,
    path: '/',
    component: CreditorReviewPage,
  });
  const detail = createRoute({
    getParentRoute: () => parent,
    path: '$id',
    component: CreditorReviewViewPage,
  });
  return parent.addChildren([list, detail]);
}
