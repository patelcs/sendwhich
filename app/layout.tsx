import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import WalletProvider from '@/providers/WalletProvider';
import ThemeProvider from '@/providers/ThemeProvider';
export { metadata } from '@/lib/metadata';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <WalletProvider>
            <Navbar />
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
