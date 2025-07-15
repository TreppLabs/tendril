import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tendril - Plant Growth Game',
  description: 'Grow your plant across a 2D landscape in this turn-based strategy game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
} 