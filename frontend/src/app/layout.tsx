import './globals.css'; //
import { Inter } from 'next/font/google';
import Navbar from '@/components/layouts/navbar'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Comic Creator App',
  description: 'Create and share your own comics easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Applied inter.className correctly */}
      <body className={`${inter.className} min-h-screen bg-gray-50`}> 
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}