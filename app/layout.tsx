import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { PageTitleProvider } from '@/components/layout/PageTitle';
import WalletProvider from '@/providers/WalletProvider';
import AddressBookProvider from '@/address-book/AddressBookProvider';
import { ToastProvider } from '@/components/ui/toast';
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
        <ToastProvider>
          <WalletProvider>
            <AddressBookProvider>
              <PageTitleProvider>
                <Navbar />
                <div className="mx-auto w-full max-w-7xl px-2 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 md:pt-10 md:pb-10">
                  {children}
                </div>
              </PageTitleProvider>
            </AddressBookProvider>
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
