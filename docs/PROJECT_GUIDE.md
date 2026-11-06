# Project Guide: Raunaq Rakesh's Digital Portfolio

## 1. What this is and who it is for

This project is the source code for a personal portfolio website belonging to Raunaq Rakesh. A portfolio site is a public web page that shows off someone's work and background. According to the owner's README, the site is meant to showcase technical builds (such as tools that use AI), lay out a career timeline that runs from designing attitude control systems for ISRO satellites to strategic consulting, and hold the owner's thoughts on AI systems, strategy tools and finance.

The intended readers are visitors to the site, such as potential employers, clients or collaborators. The material does not name a specific target audience, so that is an inference from the portfolio format. The site tries to feel unusual: it includes a 3D "Memory Palace" that visitors can walk through, a 3D "vault" of projects, and a switch between a plain "calm" wording and a technical "nerd" wording.

This guide is for a manager or new collaborator who needs to understand how the project is put together without reading code.

## 2. The big picture: the main parts

The site is built with a toolkit called Next.js (a framework for building websites) and a language called TypeScript (a stricter version of JavaScript, the web's main programming language). Below are the main parts, grouped by what they do.

### 2.1 The pages and navigation
**What it does:** Defines the web addresses the site responds to and what each one shows. The main home page assembles several sections one after another. A Work page lists every project, and each project has its own detail page. A Memory Palace page holds the 3D experience. Several older web addresses (builds, curiosities, past-battles, research, and two old project names) simply forward visitors to the new location, so old links keep working.
**Where it lives:** `src/app/` and its subfolders `atlas`, `builds`, `curiosities`, `past-battles`, `research`, `work`. The shared frame around every page (title, description, fonts, saved display mode) is in `src/app/layout.tsx`.

### 2.2 The home page sections
**What it does:** The home page is built from stacked sections: the Hero (portrait, name, role, key facts), AI builds, Experience, an invitation to the Memory Palace, Curiosities (current interests as expandable notes), About (short bio, education, current focus) and Contact (links and footer).
**Where it lives:** `src/components/` (for example `Hero.tsx`, `About.tsx`, `Contact.tsx`, `Curiosities.tsx`, `AtlasInvite.tsx`).

### 2.3 The hero "brain" knowledge map
**What it does:** At the top of the home page, a 3D brain made of points of light sits behind labels for regions and topics. Visitors can click knowledge nodes (points tied to a topic), and an explanation appears beside the brain.
**Where it lives:** `src/components/hero/` (`BrainScene.ts` draws the brain, `HeroBrain.tsx` places labels and explanations).

### 2.4 The AI builds vault
**What it does:** Shows the owner's AI projects as rooms in a 3D vault. Each room has light shafts, screenshots of the tool, architecture diagrams and video screens. There is a detail panel, filters by "wing" (a grouping of projects), and links to media.
**Where it lives:** `src/components/vault/` (`AIBuilds.tsx` is the page section, `VaultScene.ts` builds the 3D scene).

### 2.5 The Work pages and project details
**What it does:** The Work page lists every tool and platform built, with a numbered index and a preview card for each. Each project then has its own page with a cover, overview, architecture diagram, interface screenshots, demo and related work. Where a real image or video is missing, a labelled placeholder is shown instead.
**Where it lives:** `src/app/work/` for the pages, and `src/components/` for `ProjectDetail.tsx`, `ProjectPreview.tsx`, `WorkIndex.tsx`, `MediaSlot.tsx` and `CodeGraph.tsx` (which draws architecture diagrams as linked boxes in layers).

### 2.6 The Memory Palace (called the "Atlas" in the code)
**What it does:** A 3D walk through career moments. Photos are turned into 3D point clouds (images rebuilt as clouds of dots with an estimated sense of depth) and placed in the scene as "buildings". The interface adds navigation, a timeline, search, role overviews, guided tours and reading panels. There is also a pop-up viewer that shows a placeholder 3D object visitors can rotate.
**Where it lives:** `src/components/atlas/` (`AtlasEngine.ts`, `AtlasExperience.tsx`, `MemoryLayer.ts`, `ModelViewer.tsx`) and the page at `src/app/atlas/`. The code map identifies `AtlasEngine` as the most connected piece in the whole project, so it is the heart of the site.

### 2.7 The Experience journey
**What it does:** An interactive career timeline. Visitors travel through roles and open panels showing companies, projects, papers and photos. The panels look like draggable desktop windows, and each role has an animated dot globe showing travel between project locations. A moving background of code fragments and pixel blocks appears during transitions.
**Where it lives:** `src/components/experience/` (`ExperienceJourney.tsx`, `OsWindow.tsx`, `ProjectGlobe.tsx`, `GlyphField.tsx`).

### 2.8 Calm and nerd display modes
**What it does:** Every section has two versions of its wording. "Calm" is the light, plain version. "Nerd" is the terminal-style, technical version. A toggle in the navigation switches between them, and the site remembers the visitor's choice in the browser.
**Where it lives:** `src/components/` (`ModeContext.tsx`, `ModeText.tsx`, `ModeToggle.tsx`, `SectionLabel.tsx`, `SiteNav.tsx`).

### 2.9 Visual effects and helpers
**What it does:** Smaller pieces that give the site its look: images that break into pixel fragments and react to the pointer, page transitions where the screen shatters into falling rectangles, content that fades in as you scroll, and a wrapper that only loads heavy content when it is near the screen. Helper code also checks whether the visitor prefers reduced motion or has a device that can handle 3D graphics, so animations can adapt.
**Where it lives:** `src/components/` (`PixelImage.tsx`, `PixelTransition.tsx`, `Reveal.tsx`, `LazyMount.tsx`) and `src/lib/` (`motion.ts`, `placeholder.ts`, `asset.ts`, `layouts.ts`, `industrySheet.ts`).

### 2.10 Build, publishing and helper scripts
**What it does:** Turns the code into a finished website and publishes it. Two automated workflows handle this (see section 4). Small scripts in `scripts/` take screenshots of published papers, copy a hand-built home page into the final output, and generate architecture diagrams for projects.
**Where it lives:** `.github/workflows/`, `scripts/`, `home/`, and the configuration files in the top folder.

## 3. How the pieces work together: one typical journey

Imagine a recruiter opening the site for the first time.

1. **The page loads.** The shared frame in `src/app/layout.tsx` sets the title and fonts, and checks the browser for a saved calm or nerd choice before anything appears. This means the page does not flash the wrong style.
2. **The home page appears.** The Hero shows a portrait, name, role and key facts, with the 3D brain in a separate column beside them. The brain is only drawn if the device supports 3D graphics (unverified). The helper in `src/lib/motion.ts` is described as detecting this (unverified).
3. **The recruiter explores.** They click a node on the brain, and an explanation appears beside it. They scroll, and each section fades in as it comes into view.
4. **They flip the switch.** Pressing the toggle in the navigation changes the wording across the site from calm to nerd. The choice is saved for next time.
5. **They look at the AI builds.** The vault section shows project rooms in 3D (unverified). Selecting one opens a detail panel with screenshots, diagrams and demo video where available (unverified).
6. **They open the Work page.** They see a numbered list and preview cards (unverified). Clicking a card opens a full project page (unverified).
7. **They enter the Memory Palace.** An invitation on the home page leads to the Atlas (unverified). A transition shatters the screen into fragments before the 3D scene loads. They walk through career moments, search, or follow a guided tour (unverified).
8. **They reach Contact.** The final section has links to elsewhere online and the footer (unverified).

If the recruiter had followed an old link, such as the old "past-battles" address, they would have been sent automatically to the Experience section of the home page.

## 4. Where the data lives and how it gets in

### Content is kept in data files, not in the page code
The README says the site is "data-driven": the visual components hold no wording or file paths. Instead, all content sits in files under `src/data/`. To change the site, you normally edit one of these files rather than the components.

| What | File (per the README) |
| --- | --- |
| Name, descriptor, calm and nerd bio, contact links | `src/data/site.ts` |
| Builds (calm and nerd copy, tags, repo, live demo, origin role) | `src/data/builds.ts` |
| Build short name, category, featured order | `src/data/projects.ts` |
| Experience timeline | `src/data/battles.ts` |
| Papers and research threads | `src/data/research.ts` |
| Curiosities | `src/data/curiosities.ts` |
| Portrait, screenshots, demo videos, architecture graphs | `src/data/assets.ts` |
| Memory Palace segments, nodes and relationships | `src/data/atlas.ts` |

The folder listing in the material shows only `battles.ts`, `builds.ts` and `skills.ts` in the data folder, while the editing table names others. The material does not explain this difference (see section 8).

### Images, videos and diagrams
Media files are kept in `public/media/`. Each project can have three kinds of media, all registered in `src/data/assets.ts`:
- **Interface captures:** real screenshots of the tool, in `public/media/projects/<project name>/`.
- **Demo video:** added by pointing to a video file in the same folder.
- **Architecture graph:** the README text is cut off at this point, so the exact instructions are not available. The scripts folder suggests a script (`stack-graph.mjs`) builds these by scanning a project's dependency files or reading a hand-written description in `stack-specs.mjs`.

### Data produced for the static home page
A route in `src/app/home-data.json/route.ts` builds a data file at build time, drawn from the site's content (knowledge map, memories, experience, builds). A separate hand-built page, `home/index.html`, reads this file. A script (`scripts/home.mjs`) copies that page over the default home page when the site is built. The material does not say exactly why there are two home pages. See section 8.

### Paper screenshots
A manually started workflow (`capture-snapshots.yml`) runs `scripts/capture-snapshots.mjs`. It opens each published paper's IEEE Xplore page (a library of engineering research papers) in a headless browser (a web browser with no visible window), saves a screenshot, and notes any that fail. The screenshots are saved back into the repository.

### Publishing
The workflow `deploy.yml` builds the website and publishes it to GitHub Pages (a free hosting service from GitHub) whenever the main branch changes or new snapshots are added (unverified). The settings file `next.config.js` makes the site export as plain static files and sets a subfolder path that GitHub Pages needs.

### Visitor data
The only visitor information mentioned is the calm or nerd choice, stored in the visitor's own browser. The material does not mention a database, user accounts, forms, analytics or a server that stores anything.

## 5. The AI parts

**There is no AI running inside the website itself, as far as the material shows.** No file is described as calling an AI service, and the dependency list has no AI libraries. The libraries named are Next.js, React, React DOM, Three.js (for 3D graphics) and Lucide React (icons), plus styling and TypeScript tools.

AI shows up in the project in two other ways:

- **As content.** The README says the portfolio is a directory of the owner's builds, "from Python-based RAG engines to Multi-Agent LLM architectures." RAG (retrieval-augmented generation) is a technique where an AI looks up relevant documents before answering. An LLM (large language model) is the kind of AI behind chatbots. These projects are described and displayed on the site, but their code is not part of this repository as far as the material shows.
- **As tooling.** The code map at the top of the material was produced by an automated tool (it mentions "Token cost", which suggests an AI model was used to extract it). That is part of how this guide was prepared, not a feature of the site.

Whether the owner used AI tools to write the site code is not stated.

## 6. Glossary

- **Atlas:** The code name for the Memory Palace, the 3D career walk-through.
- **Architecture graph:** A diagram showing the technologies a project uses and how they connect.
- **Build (as a noun):** Here it has two meanings. In the content, a "build" is one of the owner's projects. In engineering, "to build" means to turn code into a finished website.
- **Calm mode:** The light, plain-wording version of the site.
- **Canvas:** A blank drawing area on a web page that code can paint on, used here for effects and placeholder art.
- **Component:** A reusable piece of a web page, such as a navigation bar or a section.
- **Dependency:** Another person's library of code that this project relies on.
- **Deploy:** To publish the finished site so the public can see it.
- **GitHub Pages:** A free GitHub service that hosts simple websites.
- **GitHub workflow:** An automated set of steps that GitHub runs, for example to build and publish the site.
- **Headless browser:** A web browser that runs without a visible window, used for automatic screenshots.
- **LLM:** Large language model, the type of AI behind modern chatbots.
- **Nerd mode:** The terminal-style, technical-wording version of the site.
- **Next.js:** The framework this site is built on. It organizes pages and prepares the site for publishing.
- **Node (in the brain and Atlas):** A clickable point that stands for a topic or a memory.
- **Point cloud:** A picture or shape made of many separate dots in 3D space.
- **RAG:** Retrieval-augmented generation, where an AI looks up documents before answering.
- **React:** A popular library for building interactive web pages out of components.
- **Redirect:** An automatic forward from an old web address to a new one.
- **Static site:** A website made of ready-made files, with no server working things out for each visitor.
- **Tailwind CSS:** A tool for styling web pages with short ready-made style names.
- **Three.js:** A library for drawing 3D graphics in the browser.
- **TypeScript:** A stricter form of JavaScript that catches mistakes earlier.
- **WebGL:** A browser feature that lets web pages draw 3D graphics using the device's graphics hardware.

## 7. Where to start reading, and what to be careful with

### Where to start
1. **`README.md`.** It explains the purpose, how to run the site locally, and the table of where to edit content.
2. **`src/data/`.** Reading the data files shows what the site actually says, without any display code in the way.
3. **`src/app/page.tsx`.** It shows how the home page sections are stacked.
4. **`src/components/`.** Start with `Hero.tsx`, `SiteNav.tsx` and `ModeContext.tsx`, since they set the tone and the calm and nerd switch.
5. **`src/components/atlas/AtlasEngine.ts`.** Read this last. The code map shows it as the most connected piece, and it is the most complex.

To run the site on your own computer, the README gives these steps: clone the repository, run `npm install` (or `yarn install`), then `npm run dev`, and open `http://localhost:3000`.

### What to be careful with
- **Do not hand-edit generated files.** `next-env.d.ts` and `package-lock.json` are produced automatically.
- **Put wording in the data files, not the components.** The README states that components should never hold copy or asset paths.
- **Every section needs both calm and nerd wording.** Adding one without the other would leave a gap when the toggle is used.
- **Two home pages exist.** There is a Next.js home page (`src/app/page.tsx`) and a hand-built one (`home/index.html`) that is copied over the default at build time. A change to one may not appear in the other, so check what visitors really see.
- **Old web addresses depend on the redirect pages.** Removing them would break old links.
- **Publishing is automatic.** Changes to the main branch trigger a deploy to the public site, so test before merging.
- **Paper screenshots depend on an outside site.** The snapshot script relies on IEEE Xplore pages, which may change or block automated visits. The script is described as noting failures.
- **The 3D parts are heavy.** The code uses tricks (loading only when near the screen, adapting to reduced motion, checking for WebGL) so the site works on weaker devices. Test on a phone and a low-power laptop after any change to these.
- **The code map is a snapshot.** It was built from commit `6b8ae3be` and can go stale. The map itself suggests comparing it with the current commit.
- **Some parts are placeholders.** The 3D model viewer shows a placeholder object, and missing media shows labelled placeholder art. Some pages may therefore look unfinished by design.

## 8. Open questions

- **Which data files really exist?** The folder listing names `battles.ts`, `builds.ts` and `skills.ts`, while the editing table names `site.ts`, `projects.ts`, `research.ts`, `curiosities.ts`, `assets.ts` and `atlas.ts`. The material does not say whether `skills.ts` is still used or whether the listing is out of date.
- **Why two home pages?** The material says a hand-built `home/index.html` is copied over the default home page, but does not say why, or which one is the main one.
- **What does the architecture graph step involve?** The README text was cut off. Exact instructions are missing.
- **Where does the media come from?** The material does not say whether the screenshots, videos and photos are real or still placeholders for any given project.
- **Which Work pages exist?** Several pages in `src/app/work/` are described, but the material does not give their exact addresses.
- **How is the project tested?** No tests or testing tools are mentioned.
- **Are there any costs, analytics or contact forms?** None are mentioned, and the material does not say whether the site uses any.
- **Which AI projects are listed on the site?** The README mentions RAG engines and multi-agent systems in general terms, but the names, details and locations of those projects are not in the material.
- **Is the code of the listed AI builds in this repository?** It appears not, but this is not stated.
- **Who else works on this?** The README is written in the first person by one owner. Whether others contribute is not stated.
- **What is the licence?** No licence is mentioned, so it is unclear whether others may reuse the code, even though the README invites people to "use it as inspiration."
- **The "Selected Work" preview sequence.** `layouts.ts` is described as listing six composition layouts for it, but the material does not explain how this looks or where it appears.
