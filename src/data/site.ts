// Site-wide copy. Every line here is taken from the existing portfolio content.

export const site = {
  name: 'Raunaq Rakesh',
  firstName: 'Raunaq',
  lastName: 'Rakesh',
  tagline: 'Think. Build. Solve.',
  descriptor: 'Strategy. Finance. AI. Sometimes all three at once.',
  now: 'Solving expensive problems by day, building tools by night.',
  location: 'Mumbai / Gurgaon',
  education: 'B.Tech, Mechanical Engineering. Manipal Institute of Technology, 2012 to 2016.',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/raunaqrakesh/', handle: 'in/raunaqrakesh' },
    { label: 'GitHub', href: 'https://github.com/Raunaq-nous', handle: 'Raunaq-nous' },
  ],
};

export const intro: string[] = [
  "I like problems that don't come with instructions. The kind where you have to work out the question before you can touch the answer.",
  'These days that mostly means expensive decisions in large, capital heavy industries. Someone has a very big question and a lot riding on it, and I help them get to an answer they can actually act on. Nights and weekends, I build AI tools, usually because I ran into a problem during the day and the tool I wanted did not exist yet.',
  'Before any of this I was working out how to stop a nanosatellite from tumbling in orbit. That is where I learned that a messy problem is just a clean problem you have not broken down yet. I swapped angular velocities for cash flows, but the job is basically the same. Take something tangled and make it make sense.',
];

export interface ThinkingStatement {
  id: string;
  statement: string;
  note: string;
}

// Approach statements, drawn from the existing bio, builds and research copy.
export const thinking: ThinkingStatement[] = [
  {
    id: 't1',
    statement: 'Work out the question before touching the answer.',
    note: "I like problems that don't come with instructions. The framing is usually the hard part.",
  },
  {
    id: 't2',
    statement: 'A messy problem is a clean problem not yet broken down.',
    note: 'Learned on a nanosatellite ADCS. I swapped angular velocities for cash flows, but the work is basically the same.',
  },
  {
    id: 't3',
    statement: 'Turn the slow manual process into something that runs while you are still in the room.',
    note: 'The pattern behind most of my builds: financial models, schedules, document search, surveys.',
  },
  {
    id: 't4',
    statement: 'Every build starts as a frustration, never as a product idea.',
    note: 'Each tool exists because I ran into the problem during the day and the tool I wanted did not exist yet.',
  },
  {
    id: 't5',
    statement: 'Building is a way of doing research.',
    note: 'The open questions I am working on live in the Atlas, next to the tools that test them.',
  },
];
