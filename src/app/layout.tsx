import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#F1F0EC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="calm" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap"
        />
        {/* Apply saved mode before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('site-mode');document.documentElement.setAttribute('data-mode',m==='nerd'?'nerd':'calm');}catch(e){document.documentElement.setAttribute('data-mode','calm');}})();`,
          }}
        />
      </head>
      <body>
        <ModeProvider>{children}</ModeProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
