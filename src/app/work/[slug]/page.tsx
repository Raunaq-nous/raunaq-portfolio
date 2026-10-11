import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import ProjectDetail from '@/components/ProjectDetail';
import { getProject, projects } from '@/data/projects';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProject(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} | Raunaq Rakesh`,
    description: p.punchline,
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();
  return (
    <>
      <SiteNav />
      <main>
        <ProjectDetail slug={project.slug} />
      </main>
    </>
  );
}
