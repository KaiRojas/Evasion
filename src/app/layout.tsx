import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Evasion - Social Navigation for Car Enthusiasts',
  description: 'Connect with fellow automotive enthusiasts. Share routes, join events, and explore the road together.',
  keywords: ['cars', 'automotive', 'social network', 'driving', 'routes', 'car meets', 'enthusiasts'],
  authors: [{ name: 'Evasion' }],
  openGraph: {
    title: 'Evasion',
    description: 'Social Navigation for Car Enthusiasts',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
