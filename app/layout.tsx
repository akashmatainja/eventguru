import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventGuru – Event Design & Management',
  description:
    'EventGuru plans, designs and produces weddings, corporate events, product launches and exhibitions, from the entrance gate to the main stage. See your event in 3D before it is built.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=Roboto:wght@300;400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
