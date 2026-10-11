import Link from 'next/link';
import { projects } from '@/data/projects';

/** Compact list of every project. Conventional access to all work. */
export default function WorkIndex({ title = 'Index' }: { title?: string }) {
  return (
    <div>
      <div className="label flex items-end justify-between border-b rule pb-3 text-grey-2">
        <span>{title}</span>
        <span>{projects.length} projects</span>
      </div>
      <ul>
        {projects.map((p) => (
          <li key={p.slug} className="border-b rule">
            <Link
              href={`/work/${p.slug}/`}
              className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4 transition-colors hover:bg-ink-2 sm:grid-cols-[4rem_1fr_14rem_6rem]"
            >
              <span className="label text-grey-3">{p.number}</span>
              <span className="text-2xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl">{p.name}</span>
              <span className="label hidden text-grey-2 sm:block">{p.category}</span>
              <span className="label text-right text-grey-3 group-hover:text-paper">
                {p.github ? 'Repo  ' : ''}<span aria-hidden>→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
