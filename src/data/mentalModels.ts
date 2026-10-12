// Mental models, condensed from the reference article to one line each. They feed the hero
// brain: the logical families sit in the left hemisphere, the lenses on nature, art and people
// in the right.

export interface MentalModel {
  name: string;
  line: string;
}

export interface ModelFamily {
  id: string;
  label: string;
  side: 'left' | 'right';
  models: MentalModel[];
}

export const modelFamilies: ModelFamily[] = [
  {
    id: 'thinking',
    label: 'General thinking',
    side: 'left',
    models: [
      { name: 'The map is not the territory', line: 'Models compress reality; they are not reality. Choose your cartographer wisely.' },
      { name: 'Circle of competence', line: 'Knowing the edge of what you know matters more than the size of it.' },
      { name: 'First principles', line: 'Break a problem down to its fundamental truths and build up from there.' },
      { name: 'Thought experiments', line: 'A sandbox for ideas. Most insights start with: what if?' },
      { name: 'Second-order thinking', line: 'Ask: and then what? Play the long game.' },
      { name: 'Probabilistic thinking', line: 'Think in odds, check assumptions, update as evidence arrives.' },
      { name: 'Inversion', line: 'Ask what would guarantee failure, then avoid it.' },
      { name: "Occam's razor", line: 'Prefer the explanation with the fewest assumptions, until proven otherwise.' },
      { name: "Hanlon's razor", line: 'Do not assume malice where a mistake is the likelier explanation.' },
    ],
  },
  {
    id: 'systems',
    label: 'Systems',
    side: 'left',
    models: [
      { name: 'Feedback loops', line: 'Outputs become inputs. Without feedback, a system repeats itself.' },
      { name: 'Equilibrium', line: 'Systems keep adjusting toward balance and rarely stay there.' },
      { name: 'Bottlenecks', line: 'The slowest part sets the pace of the whole. Fix that first.' },
      { name: 'Scale', line: 'Systems change as they grow; new problems appear at new sizes.' },
      { name: 'Margin of safety', line: 'Build in a buffer for what you did not plan for.' },
      { name: 'Churn', line: 'Some turnover keeps a system healthy; too much kills it.' },
      { name: 'Algorithms', line: 'Crisp if-then steps that reliably produce the result.' },
      { name: 'Critical mass', line: 'Slowly, then all at once: the tipping point to self-sustaining change.' },
      { name: 'Emergence', line: 'Combinations create properties none of the parts have.' },
      { name: 'Irreducibility', line: 'Some things lose their essence when broken into parts.' },
      { name: 'Diminishing returns', line: 'Easy wins come first; know when to stop optimizing.' },
    ],
  },
  {
    id: 'maths',
    label: 'Mathematics',
    side: 'left',
    models: [
      { name: 'Sampling', line: 'Small samples mislead. Ask how much of the world you are looking at.' },
      { name: 'Randomness', line: 'We see patterns where there are none.' },
      { name: 'Regression to the mean', line: 'Extreme results are rarely repeated.' },
      { name: 'Multiply by zero', line: 'One failing component can zero out everything else.' },
      { name: 'Equivalence', line: 'Different inputs can produce the same result.' },
      { name: 'Surface area', line: 'More exposure means more contact: more ideas, more risk.' },
      { name: 'Global and local maxima', line: 'Do not settle for the first peak; sometimes go down to climb higher.' },
    ],
  },
  {
    id: 'economics',
    label: 'Economics',
    side: 'left',
    models: [
      { name: 'Scarcity', line: 'What is scarce becomes valuable, including rare combinations of traits.' },
      { name: 'Supply and demand', line: 'The push and pull that sets price and allocation.' },
      { name: 'Optimization', line: 'Make the most of what you have, until it stops working for you.' },
      { name: 'Trade-offs and opportunity cost', line: 'Every yes is a no to something else.' },
      { name: 'Specialization', line: 'Go deep without getting stuck; the best finds sit at the edges.' },
      { name: 'Interdependence', line: 'No one is self-made. Dependence is strength and exposure.' },
      { name: 'Efficiency', line: 'Perfect short-term efficiency makes a system fragile.' },
      { name: 'Debt', line: 'Leverage that borrows from your future room to manoeuvre.' },
      { name: 'Monopoly and competition', line: 'Competition keeps firms honest; monopolies fund moon shots.' },
      { name: 'Creative destruction', line: 'The new replaces the old. Opportunity and threat at once.' },
      { name: "Gresham's law", line: 'Without consequences, bad drives out good.' },
      { name: 'Bubbles', line: 'Enthusiasm runs ahead of value. All bubbles pop.' },
    ],
  },
  {
    id: 'strategy',
    label: 'Military and strategy',
    side: 'left',
    models: [
      { name: 'Seeing the front', line: 'Go and look before deciding; reports and maps can be biased.' },
      { name: 'Asymmetric warfare', line: 'The weaker side plays by different rules.' },
      { name: 'Two-front war', line: 'Splitting force weakens both fronts; settle internal discord first.' },
      { name: 'Mutually assured destruction', line: 'Strong opponents avoid destroying each other, until a mistake.' },
    ],
  },
  {
    id: 'nature',
    label: 'Physics, chemistry, biology',
    side: 'right',
    models: [
      { name: 'Relativity', line: 'Perception depends on vantage point. Ask what others see that you cannot.' },
      { name: 'Reciprocity', line: 'Go positive and go first; the world tends to return it.' },
      { name: 'Thermodynamics', line: 'Energy is conserved, entropy rises. Order takes work.' },
      { name: 'Inertia', line: 'The status quo resists change; start small to move it.' },
      { name: 'Friction and viscosity', line: 'Removing resistance is often easier than adding force.' },
      { name: 'Velocity', line: 'Speed with direction. Circles at speed go nowhere.' },
      { name: 'Leverage', line: 'Small force, applied well, moves large things. Both ways.' },
      { name: 'Activation energy', line: 'The upfront push is a cost, not a permanent obstacle.' },
      { name: 'Catalysts', line: 'Accelerate change without being consumed; be one for others.' },
      { name: 'Alloying', line: 'The right blend of skills is worth more than the sum.' },
      { name: 'Natural selection and extinction', line: 'The adaptive survive; the unfit are swept away.' },
      { name: 'Red Queen effect', line: 'No permanent lead. Keep running to stay in place.' },
      { name: 'Ecosystems', line: 'Nothing exists in isolation. First, do no harm.' },
      { name: 'Niches', line: 'Be the best at a specific place, and adapt it as the world moves.' },
      { name: 'Self-preservation', line: 'Protect what matters; often the biggest risk is no risk.' },
      { name: 'Replication', line: 'Imitate to reach the baseline, then innovate.' },
      { name: 'Cooperation', line: 'The model that explains humanity.' },
      { name: 'Hierarchical organization', line: 'Structure lets scale happen; too much breeds unrest.' },
      { name: 'Incentives', line: 'Show me the incentive and I will show you the outcome.' },
      { name: 'Minimizing energy output', line: 'We follow the path of least resistance; reflection costs energy.' },
    ],
  },
  {
    id: 'art',
    label: 'Art',
    side: 'right',
    models: [
      { name: 'Audience', line: 'The silent co-creator. Never forget them, never let them dictate.' },
      { name: 'Genre', line: 'Rules that create room for invention.' },
      { name: 'Contrast', line: 'Differences make us notice.' },
      { name: 'Framing', line: 'The same thing, presented differently, is chosen differently.' },
      { name: 'Rhythm', line: 'The pattern that gives time its structure.' },
      { name: 'Melody', line: 'A shape that feels inevitable and fresh at once.' },
      { name: 'Representation', line: 'Every symbol is an interpretation of what it stands for.' },
      { name: 'Plot', line: 'Change the story you tell yourself to change the result.' },
      { name: 'Character', line: 'Obstacles reveal who someone is.' },
      { name: 'Setting', line: 'To change behaviour, change the environment.' },
      { name: 'Performance', line: 'Presence and vulnerability, live and unrepeatable.' },
    ],
  },
  {
    id: 'judgment',
    label: 'Human nature and judgment',
    side: 'right',
    models: [
      { name: 'Trust', line: 'The modern world runs on it; the rewards are extremely high.' },
      { name: 'Bias from incentives', line: 'We believe what it pays us to believe.' },
      { name: 'Pavlovian association', line: 'Emotion attaches to what is merely associated.' },
      { name: 'Envy and jealousy', line: 'Systems that ignore envy tend to self-destruct.' },
      { name: 'Liking and disliking', line: 'We overrate what we like and miss nuance in what we do not.' },
      { name: 'Denial', line: 'Coping mechanism, survival mechanism, tactic.' },
      { name: 'Availability heuristic', line: 'We recall the salient, frequent and recent.' },
      { name: 'Representativeness', line: 'Base rates ignored, stereotypes and false conjunctions.' },
      { name: 'Social proof', line: 'Safety in numbers, and foolishness in numbers.' },
      { name: 'Narrative instinct', line: 'The storytelling animal runs its institutions on stories.' },
      { name: 'Curiosity instinct', line: 'Humans innovated out of curiosity before there was reward.' },
      { name: 'Language instinct', line: 'Grammar carries infinite meaning.' },
      { name: 'First-conclusion bias', line: 'The first idea gets in and the mind shuts.' },
      { name: 'Small-sample overgeneralization', line: 'A few instances become a rule.' },
      { name: 'Relative satisfaction', line: 'Happiness is measured against peers and our past.' },
      { name: 'Commitment and consistency', line: 'We stay consistent with our past selves, even when wrong.' },
      { name: 'Hindsight bias', line: 'We knew it all along. Keep a decision journal.' },
      { name: 'Sensitivity to fairness', line: 'Justice runs deep, and moves over time.' },
      { name: 'Fundamental attribution error', line: 'We blame traits and forget situations.' },
      { name: 'Influence of stress', line: 'Under stress we fall to the level of our training.' },
      { name: 'Survivorship bias', line: 'We study the winners and miss the silent grave.' },
      { name: 'Tendency to want to do something', line: 'We act even when action is not needed.' },
      { name: 'Confirmation bias and falsification', line: 'What we believe is what we choose to see.' },
    ],
  },
];
