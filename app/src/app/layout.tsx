import type { Metadata } from "next";
import "@mantine/core/styles.layer.css";
import { MantineProvider, createTheme } from "@mantine/core";
import "@fontsource/libre-baskerville";
import "@fontsource-variable/plus-jakarta-sans";
// import "./globals.css";

const theme = createTheme({
  fontFamily: '"Plus Jakarta Sans Variable", sans-serif',
  fontFamilyMonospace: "IBM Mono, Courier, monospace",
  headings: {
    fontFamily: '"Libre Baskerville", serif',
  },
});

export const metadata: Metadata = {
  title: "alexis",
  description: "this is alexis wei",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
