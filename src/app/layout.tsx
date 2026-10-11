import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raunaq Rakesh | Think. Build. Solve.',
  description: 'Strategy. Finance. AI. Sometimes all three at once.',
  openGraph: {
    title: 'Raunaq Rakesh | Think. Build. Solve.',
    description: 'Strategy. Finance. AI. Sometimes all three at once.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#090909',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
