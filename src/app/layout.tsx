import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raunaq Rakesh \u2014 Think. Build. Solve.',
  description: 'Strategy. AI. Capital. Sometimes all three at once.',
  openGraph: {
    title: 'Raunaq Rakesh \u2014 Think. Build. Solve.',
    description: 'Strategy. AI. Capital. Sometimes all three at once.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
