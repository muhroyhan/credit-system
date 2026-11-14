import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@web/query-client';
import { router } from '@web/router';
import { theme } from '@web/theme';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element is missing');
}
createRoot(root).render(
  <MantineProvider theme={theme} forceColorScheme="light">
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MantineProvider>,
);
