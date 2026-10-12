<div align="center">
  <h1>✨ Raunaq Rakesh | Digital Portfolio</h1>
  <p><strong>THINK. BUILD. SOLVE.</strong></p>
  <p><i>A digital intersection of strategy, finance, and technology.</i></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 About This Repository

This repository contains the source code for my personal digital portfolio and engineering playground. It serves as a centralized hub to showcase my professional trajectory, AI engineering projects, and strategic insights. 

Built from the ground up as a responsive, modern web application, this portfolio reflects my philosophy: navigating ambiguous problems, advising on high-stakes decisions, and building tools when the right ones don't yet exist. 

### 🎯 Purpose
- **Showcase Technical Builds:** A directory of tools I've engineered—from Python-based RAG engines to Multi-Agent LLM architectures.
- **Document Professional Battles:** A timeline of my career spanning from designing attitude control systems for ISRO satellites to high-stakes strategic consulting.
- **Log Curiosities & Learnings:** A living space for my thoughts on AI systems, strategy tools, and finance.

---

## 🚀 Key Features

*   🌗 **Dark/Light Mode:** Seamless theme switching with a custom `ModeContext`.
*   📱 **Fully Responsive Layout:** Optimized for desktop, tablet, and mobile viewing.
*   📊 **Dynamic Data Architecture:** Projects, skills, and experiences are systematically stored in TypeScript data files for easy updates and scaling.
*   ⚡ **High Performance:** Built on Next.js App Router for optimal rendering speeds and SEO.

---

## 🛠️ Built With

This application leverages a modern web development stack designed for speed, scalability, and clean aesthetics:

*   **Framework:** [Next.js (App Router)](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)

---

## ⚙️ Getting Started (Local Development)

Want to run this portfolio locally or use it as inspiration? Follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Raunaq-nous/raunaq-portfolio.git
cd raunaq-portfolio
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Run the development server
```bash
npm run dev
# or
yarn dev
```

### 4. Open in Browser
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## 📁 Repository Structure

```text
raunaq-portfolio/
├── src/
│   ├── app/              # Next.js App Router pages (Home, Builds, Skills, etc.)
│   ├── components/       # Reusable UI components (Header, Footer, ModeToggle)
│   └── data/             # Content data files (battles.ts, builds.ts, skills.ts)
├── public/               # Static assets (images, icons)
├── tailwind.config.js    # Tailwind CSS styling configurations
└── package.json          # Project dependencies and scripts
```

---

<div align="center">
  <i>"Sometimes the fastest path is just building the thing yourself."</i><br><br>
  <a href="https://github.com/Raunaq-nous">GitHub Profile</a>
</div>

---

## Editing content and media

All content is data-driven. Components never hold copy or asset paths. Every section has calm and
nerd copy; the toggle in the navigation switches between them (calm is light, nerd is the terminal).

| What | Where |
| --- | --- |
| Name, descriptor, calm and nerd bio, contact links | `src/data/site.ts` |
| Builds (calm and nerd copy, tags, repo, live demo, origin role) | `src/data/builds.ts` |
| Build slug, category, featured order | `src/data/projects.ts` |
| Experience timeline (roles, engagements, industries) | `src/data/battles.ts` |
| Papers, research threads, curiosities | `src/data/research.ts`, `src/data/curiosities.ts` |
| Portrait, interface captures, demo videos, architecture graphs | `src/data/assets.ts` (files in `public/media/`) |
| Knowledge Atlas segments, nodes and relationships | `src/data/atlas.ts` |

### Media per build

Each build has three kinds of media, all registered in `src/data/assets.ts`:

- **Interface captures**: real screens of the tool, listed in `captures` (files in `public/media/projects/<slug>/`).
- **Demo video**: add `demo: { asset: { src: '/media/projects/<slug>/demo.mp4' } }` to `projectMediaOverrides`.
- **Architecture graph**: run `node scripts/stack-graph.mjs <slug> <repo-dir>` to scan a checkout's manifests (package.json, pyproject, requirements, Docker, Vercel, workflows, model IDs in source) into `public/media/projects/<slug>/stack.json`. AI features and extra nodes live in `scripts/stack-specs.mjs`; for a repo you can't scan, write its stack there and run with `--spec`.

Slots without an asset render a labelled placeholder.

### Paper snapshots

Run the **Capture paper snapshots** workflow (Actions tab, workflow_dispatch). It screenshots the
IEEE Xplore page for each paper into `public/media/snapshots/` and commits them. Then run
**Deploy to GitHub Pages** to publish. Missing snapshots fall back to a labelled card.

### Atlas

Atlas nodes are derived from the data files above. Add extra nodes or links through `extraNodes`
and `extraEdges` in `src/data/atlas.ts`; positions and coordinates are computed automatically.

### Memories (photos in the Atlas)

Photos are listed in `memories` in `src/data/assets.ts`, each tied to a role id from
`src/data/battles.ts` (e.g. `parikshit`, `madcue`, `aranca`). Put the files in
`public/media/memories/<role>/`. In the Atlas each photo floats beside its role and lifts from a
flat photo into a depth map and then a 3D point cloud. Depth is estimated in the browser from the
image itself, so no extra processing step is needed.

### Project scenes and geographies

Every role in the Memory Palace plays the same sequence: one scene per key project, then photos,
then papers. Scenes come from `keyProjects` in `src/data/battles.ts`: each project's `industry`,
`problem` and `geos` are drawn as a spec sheet, lifted into a point cloud, and shown in the
readout beside it. `geos` are keys into `places` in `src/data/geo.ts`, which also drive the
experience globes. A role with no key projects gets a single scene from its own description.
