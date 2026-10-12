// Places used by the project globes. Cities are where a role was based; countries and regions are
// where a project's client or work was, as given for each project (geos in src/data/battles.ts).
// Country and region markers sit on a capital or a rough centre, not on an office.
import { battles } from './battles';

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

export const places: Record<string, Place> = {
  gurugram: { label: 'Gurugram', lat: 28.46, lon: 77.03 },
  mumbai: { label: 'Mumbai', lat: 19.07, lon: 72.88 },
  delhi: { label: 'Delhi', lat: 28.61, lon: 77.21 },
  bangalore: { label: 'Bangalore', lat: 12.97, lon: 77.59 },
  manipal: { label: 'Manipal', lat: 13.35, lon: 74.79 },
  kochi: { label: 'Kochi', lat: 9.93, lon: 76.26 },
  'big-sky': { label: 'Big Sky, Montana', lat: 45.28, lon: -111.37 },
  india: { label: 'India', lat: 22.5, lon: 79.0 },
  usa: { label: 'United States', lat: 39.5, lon: -98.35 },
  canada: { label: 'Canada', lat: 56.1, lon: -106.3 },
  'north-america': { label: 'North America', lat: 42.0, lon: -95.0 },
  'south-america': { label: 'South America', lat: -15.0, lon: -58.0 },
  uk: { label: 'United Kingdom', lat: 52.5, lon: -1.5 },
  france: { label: 'France', lat: 46.6, lon: 2.4 },
  germany: { label: 'Germany', lat: 51.2, lon: 10.4 },
  emea: { label: 'EMEA', lat: 45.0, lon: 15.0 },
  japan: { label: 'Japan', lat: 36.2, lon: 138.3 },
  saudi: { label: 'Saudi Arabia', lat: 23.9, lon: 45.1 },
  philippines: { label: 'Philippines', lat: 12.9, lon: 121.8 },
};

/** Where each role was based. */
export const roleBase: Record<string, string> = {
  bain: 'gurugram',
  aranca: 'mumbai',
  evalueserve: 'gurugram',
  tecnova: 'gurugram',
  delbomblr: 'delhi',
  madcue: 'manipal',
  parikshit: 'manipal',
};

/** Places per role, one list per key project, in order. */
export const roleGeos: Record<string, string[][]> = Object.fromEntries(
  battles.map((b) => [b.id, (b.keyProjects ?? []).map((k) => k.geos ?? []).filter((g) => g.length)]),
);

/** Every distinct place a role touched, base first. */
export function rolePlaces(role: string): Place[] {
  const keys = [roleBase[role], ...(roleGeos[role] ?? []).flat()].filter(Boolean);
  return [...new Set(keys)].map((k) => places[k]).filter(Boolean);
}
