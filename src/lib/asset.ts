// Prefixes local asset paths with the GitHub Pages base path.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function asset(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${BASE_PATH}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function pad(n: number, width = 2): string {
  const s = String(Math.abs(Math.round(n)));
  return s.padStart(width, '0');
}

export function signed(n: number, digits = 1, width = 2): string {
  const sign = n < 0 ? '-' : ' ';
  const [int, dec] = Math.abs(n).toFixed(digits).split('.');
  return `${sign}${int.padStart(width, '0')}${dec ? '.' + dec : ''}`;
}
