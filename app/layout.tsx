import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import WalletProvider from '@/providers/WalletProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import AddressBookProvider from '@/address-book/AddressBookProvider';
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
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <WalletProvider>
            <AddressBookProvider>
              <Navbar />
              <div className="mx-auto w-full max-w-7xl px-2 pt-2 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 md:pt-10 md:pb-10">
                {children}
              </div>
            </AddressBookProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
