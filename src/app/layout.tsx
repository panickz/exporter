import type { Metadata } from 'next';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js Candidate Project',
  description: 'A Next.js project for interview candidates',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='antialiased'>
        <ThemeProvider attribute='class'>
          <Theme>{children}</Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
