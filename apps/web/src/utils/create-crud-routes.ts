import type { RouteComponent } from '@tanstack/react-router';
import { type AnyRoute, createRoute } from '@tanstack/react-router';

/** Attaches the four standard CRUD pages while preserving the parent route type. */
export function createCrudRoutes<
  TParent extends AnyRoute,
  TExtra extends AnyRoute[],
>(
  parent: TParent,
  pages: {
    list: RouteComponent;
    add: RouteComponent;
    edit: RouteComponent;
    view: RouteComponent;
  },
  ...extra: TExtra
) {
  const list = createRoute({
    getParentRoute: () => parent,
    path: '/',
    component: pages.list,
  });
  const add = createRoute({
    getParentRoute: () => parent,
    path: 'add',
    component: pages.add,
  });
  const edit = createRoute({
    getParentRoute: () => parent,
    path: '$id/edit',
    component: pages.edit,
  });
  const view = createRoute({
    getParentRoute: () => parent,
    path: '$id',
    component: pages.view,
  });
  return parent.addChildren([list, add, edit, view, ...extra]);
}
