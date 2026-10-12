import SiteNav from '@/components/SiteNav';
import Hero from '@/components/Hero';
import AIBuilds from '@/components/vault/AIBuilds';
import AtlasInvite from '@/components/AtlasInvite';
import ExperienceJourney from '@/components/experience/ExperienceJourney';
import Curiosities from '@/components/Curiosities';
import About from '@/components/About';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <AIBuilds />
        <ExperienceJourney />
        <AtlasInvite />
        <Curiosities />
        <About />
        <Contact />
      </main>
    </>
  );
}
