import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { RegistrationPage } from '@web/features/registration/RegistrationPage';

export function registrationRoutes<T extends AnyRoute>(parent: T) {
  return parent.addChildren([
    createRoute({
      getParentRoute: () => parent,
      path: '$slug',
      component: RegistrationPage,
    }),
  ]);
}
