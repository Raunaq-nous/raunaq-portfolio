'use client';

/*
 * Links a project page to its repository's Code explorer, if one has been published.
 * The explorers live in public/code/<repo>/ and are listed in public/code/manifest.json,
 * which the clarity kit's `clarity.py publish` command writes. Renders nothing when the
 * project has no explorer yet, so pages never show a dead link.
 */
import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';
import { VERDICT, type CodeEntry } from '@/data/code';

let manifest: Promise<CodeEntry[]> | null = null;

export function loadCodeManifest(): Promise<CodeEntry[]> {
  if (!manifest) {
    manifest = fetch(asset('/code/manifest.json'))
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d) => (Array.isArray(d.entries) ? d.entries : []))
      .catch(() => []);
  }
  return manifest;
}

export default function CodeExplorerLink({ slug, variant = 'section' }: { slug: string; variant?: 'header' | 'section' }) {
  const [entry, setEntry] = useState<CodeEntry | null>(null);

  useEffect(() => {
    let live = true;
    loadCodeManifest().then((list) => {
      if (live) setEntry(list.find((e) => e.project === slug) ?? null);
    });
    return () => {
      live = false;
    };
  }, [slug]);

  if (!entry) return null;
  const href = asset(`/code/${entry.slug}/`);

  if (variant === 'header') {
    return (
      <a href={href} className="label link-quiet text-paper">
        Code explorer
      </a>
    );
  }

  return (
    <div className="mt-12 grid gap-6 border-t rule pt-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="label text-grey-3">Inside the code / {entry.name}</p>
        <p className="mt-3 max-w-xl text-[15px] leading-snug text-grey-1">
          Every file explained in plain English, with a note beside each section of the code: what it does, why it
          exists, what can go wrong and how ready it is for real use.
        </p>
        <p className="label mt-4 flex flex-wrap gap-5 text-grey-2">
          <span>
            {entry.explained}/{entry.files} files explained
          </span>
          <span>{entry.sections.toLocaleString('en')} sections</span>
          <span>Readiness: {VERDICT[entry.readiness] ?? 'Not checked'}</span>
          {entry.visibility === 'private' ? <span>Private: notes only</span> : entry.mode === 'notes' && <span>Notes only</span>}
        </p>
      </div>
      <div className="flex flex-wrap gap-5">
        <a href={href} className="label link-quiet text-paper">
          Open the code explorer
        </a>
        {entry.map && (
          <a href={asset(`/code/${entry.slug}/map.html`)} className="label link-quiet text-grey-1">
            Technical map
          </a>
        )}
      </div>
    </div>
  );
}
