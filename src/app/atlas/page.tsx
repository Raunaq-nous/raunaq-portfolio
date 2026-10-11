import type { Metadata } from 'next';
import AtlasExperience from '@/components/atlas/AtlasExperience';

export const metadata: Metadata = {
  title: 'Knowledge Atlas | Raunaq Rakesh',
  description: 'A spatial map of projects, code, research and visual studies, and how they connect.',
};

export default function AtlasPage() {
  return <AtlasExperience />;
}
