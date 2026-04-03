import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border py-10 mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-text-primary">Raunaq Rakesh</p>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://www.linkedin.com/in/raunaqrakesh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors text-xs font-mono"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Raunaq-nous"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors text-xs font-mono"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
