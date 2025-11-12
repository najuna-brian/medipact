import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navigation from '@/components/Navigation/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { ToastContainer } from '@/components/Toast/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MediPact - The Verifiable Health Pact',
  description: 'A verifiable medical data marketplace built on Hedera Hashgraph',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          <ErrorBoundary>
            <Navigation />
            {children}
            <ToastContainer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
