// Places used by the project globe. Region-level markers are approximate centres, not offices.
// Each project's places come from its own description (e.g. "EMEA", "India entry").

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

export const places: Record<string, Place> = {
  europe: { label: 'Europe', lat: 50.1, lon: 8.7 },
  'middle-east': { label: 'Middle East', lat: 25.2, lon: 55.3 },
  africa: { label: 'Africa', lat: -1.3, lon: 36.8 },
  apac: { label: 'Asia Pacific', lat: 1.35, lon: 103.8 },
  'north-america': { label: 'North America', lat: 40.7, lon: -74.0 },
  usa: { label: 'United States', lat: 38.9, lon: -77.0 },
  canada: { label: 'Canada', lat: 45.4, lon: -75.7 },
  france: { label: 'France', lat: 48.86, lon: 2.35 },
  germany: { label: 'Germany', lat: 48.14, lon: 11.58 },
  india: { label: 'India', lat: 19.07, lon: 72.88 },
  mumbai: { label: 'Mumbai', lat: 19.07, lon: 72.88 },
  gurgaon: { label: 'Gurgaon', lat: 28.46, lon: 77.03 },
  delhi: { label: 'Delhi', lat: 28.61, lon: 77.21 },
  bangalore: { label: 'Bangalore', lat: 12.97, lon: 77.59 },
  manipal: { label: 'Manipal', lat: 13.35, lon: 74.79 },
  kochi: { label: 'Kochi', lat: 9.93, lon: 76.26 },
  'big-sky': { label: 'Big Sky, Montana', lat: 45.28, lon: -111.37 },
};

/** Where each role was based. */
export const roleBase: Record<string, string> = {
  bain: 'gurgaon',
  aranca: 'mumbai',
  evalueserve: 'gurgaon',
  tecnova: 'gurgaon',
  delbomblr: 'delhi',
  madcue: 'bangalore',
  parikshit: 'manipal',
};

/** Places per role: the base first, then each project's geography in order. */
export const roleGeos: Record<string, string[][]> = {
  aranca: [['europe'], ['europe', 'middle-east'], ['europe'], ['north-america'], ['india'], ['europe'], ['apac', 'europe', 'africa'], ['north-america'], ['europe', 'middle-east'], ['europe']],
  evalueserve: [['india'], ['india'], ['usa'], ['canada'], ['india']],
  tecnova: [['france', 'india'], ['usa'], ['germany', 'india'], ['europe', 'india'], ['india']],
  parikshit: [['big-sky'], ['kochi'], ['kochi'], ['big-sky']],
};
