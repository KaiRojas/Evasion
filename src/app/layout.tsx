import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#06040A] text-[#F5F5F4] antialiased font-[family-name:var(--font-outfit)]">
        {children}
      </body>
    </html>
  );
}
