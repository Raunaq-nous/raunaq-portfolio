import SiteNav from '@/components/SiteNav';
import Hero from '@/components/Hero';
import SelectedWork from '@/components/SelectedWork';
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
        <SelectedWork />
        <ExperienceJourney />
        <AtlasInvite />
        <Curiosities />
        <About />
        <Contact />
      </main>
    </>
  );
}
