import type { Metadata } from 'next';
import AtlasExperience from '@/components/atlas/AtlasExperience';

export const metadata: Metadata = {
  title: 'Memory Palace | Raunaq Rakesh',
  description: 'Moments from my career, left where they happened and lifted from 2D into 3D.',
};

export default function AtlasPage() {
  return <AtlasExperience />;
}
