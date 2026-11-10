import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { About, Builds, Contact, Footer, Process, Services } from '@/components/site/Sections';

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#about">
        Skip the film
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Builds />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
