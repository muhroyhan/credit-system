import { createTheme } from '@mantine/core';

/** Maps the retained brand tokens to standard Mantine component variants. */
export const theme = createTheme({
  fontFamily: 'Inter, Arial, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", monospace',
  defaultRadius: 'md',
  primaryColor: 'brand',
  primaryShade: 6,
  autoContrast: true,
  colors: {
    brand: [
      '#effcf1',
      '#d8f7dd',
      '#b1efbb',
      '#88e798',
      '#60df75',
      '#40d858',
      '#2ECC40',
      '#26b638',
      '#209f30',
      '#198329',
    ],
  },
  headings: { sizes: { h1: { fontSize: '2.25rem' } } },
});
