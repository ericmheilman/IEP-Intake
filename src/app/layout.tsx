import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Logo from '@/components/Logo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'University Startups - IEP Processor',
  description: 'AI-powered IEP document processing and compliance scoring',
  keywords: ['IEP', 'education', 'compliance', 'AI', 'processing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Logo size="md" showText={true} />
                  <span className="text-sm text-gray-500">IEP Processor</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">PoV v1.0</span>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

