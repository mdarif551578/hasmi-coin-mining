import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { BottomNavBar } from '@/components/BottomNavBar';

export const metadata: Metadata = {
  title: 'Hasmi Coin Mining',
  description: 'Gamified token economy with mining-like mechanics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative flex flex-col min-h-screen">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNavBar />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
