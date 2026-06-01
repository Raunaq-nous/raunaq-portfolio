import type { Metadata } from 'next';
import { ModeProvider } from '@/components/ModeContext';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&display=swap"
          rel="stylesheet"
        />
        {/* Apply saved mode before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('site-mode');document.documentElement.setAttribute('data-mode',m==='nerd'?'nerd':'calm');}catch(e){document.documentElement.setAttribute('data-mode','calm');}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
