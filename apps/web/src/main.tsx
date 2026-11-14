import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@web/query-client';
import { router } from '@web/router';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element is missing');
}
const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'md',
  primaryColor: 'blue',
});
createRoot(root).render(
  <MantineProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MantineProvider>,
);
