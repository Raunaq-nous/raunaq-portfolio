/*
 * Index of every published Code explorer, one per repository, named after the repository.
 * Reads public/code/manifest.json at build time, so the list always matches what the refresh
 * routine (tools/clarity) has published in public/code/.
 */
import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import { projects } from '@/data/projects';
import { asset } from '@/lib/asset';
import { VERDICT, type CodeEntry } from '@/data/code';

export const metadata: Metadata = {
  title: 'Inside the code | Raunaq Rakesh',
  description: 'Every repository, explained file by file in plain English.',
};

function loadManifest(): { entries: CodeEntry[]; updated?: string } {
  try {
    const file = path.join(process.cwd(), 'public', 'code', 'manifest.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { entries: Array.isArray(data.entries) ? data.entries : [], updated: data.updated_at };
  } catch {
    return { entries: [] };
  }
}

export default function CodeIndexPage() {
  const { entries, updated } = loadManifest();
  entries.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

  return (
    <>
      <SiteNav />
      <main className="wrap pb-32 pt-[calc(var(--nav-h)+72px)]">
        <p className="label flex flex-wrap gap-5 text-grey-2">
          <span>Code explorer</span>
          <span>{entries.length} repositories</span>
          {updated && <span>Refreshed {updated.slice(0, 10)}</span>}
        </p>
        <h1 className="display mt-6 text-[clamp(64px,12vw,200px)]">Inside the code</h1>
        <p className="mt-8 max-w-2xl text-[17px] leading-snug text-grey-1">
          Every repository, explained file by file in plain English: what each part does, why it exists, what can go
          wrong, and how ready it is for real use. Each explorer opens on a map of the system. Private repositories show
          their notes and map, not their code. The notes refresh as the code changes.
        </p>
        {entries.length === 0 ? (
          <p className="mt-20 text-grey-2">No explorers published yet.</p>
        ) : (
          <ul className="mt-20 border-t rule">
            {entries.map((e, i) => {
              const project = e.project ? projects.find((p) => p.slug === e.project) : undefined;
              return (
                <li key={e.slug} className="border-b rule">
                  <div className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 gap-y-2 py-6">
                    <span className="label text-grey-3">{String(i + 1).padStart(2, '0')}</span>
                    <a href={asset(`/code/${e.slug}/`)} className="group text-2xl tracking-tight">
                      <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">{e.name}</span>
                    </a>
                    <span className="label text-grey-2">{VERDICT[e.readiness] ?? 'Not checked'}</span>
                    {e.summary && <span className="col-span-2 col-start-2 max-w-2xl text-[14px] text-grey-2">{e.summary}</span>}
                    <span className="label col-span-2 col-start-2 flex flex-wrap gap-5 text-grey-3">
                      <span>{e.files === 0 ? 'No code yet' : `${e.explained}/${e.files} files explained`}</span>
                      {e.files > 0 && <span>{e.lines.toLocaleString('en')} lines</span>}
                      <span>{e.visibility === 'private' ? 'Private: notes only' : e.mode === 'notes' ? 'Notes only' : 'Code and notes'}</span>
                      {project && (
                        <Link href={`/work/${project.slug}/`} className="link-quiet text-grey-1">
                          Project page: {project.name}
                        </Link>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
