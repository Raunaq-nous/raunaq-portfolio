import SiteNav from '@/components/SiteNav';
import Hero from '@/components/Hero';
import SelectedWork from '@/components/SelectedWork';
import AtlasInvite from '@/components/AtlasInvite';
import Thinking from '@/components/Thinking';
import Experience from '@/components/Experience';
import About from '@/components/About';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <SelectedWork />
        <AtlasInvite />
        <Thinking />
        <Experience />
        <About />
        <Contact />
      </main>
    </>
  );
}
