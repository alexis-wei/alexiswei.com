import type { Metadata } from 'next';
import '@mantine/core/styles.layer.css';
import { MantineProvider, createTheme } from '@mantine/core';
import '@fontsource/libre-baskerville';
import '@fontsource-variable/plus-jakarta-sans';

const theme = createTheme({
  fontFamily: '"Plus Jakarta Sans Variable", sans-serif',
  fontFamilyMonospace: 'IBM Mono, Courier, monospace',
  headings: {
    fontFamily: '"Libre Baskerville", serif',
  },
});

export const metadata: Metadata = {
  title: 'alexis wei | design engineer',
  description: 'alexis wei | design engineer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="icon"
        type="image/png"
        href="/favicon-48x48.png"
        sizes="48x48"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <meta name="apple-mobile-web-app-title" content="alexiswei" />
      <link rel="manifest" href="/site.webmanifest" />
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
