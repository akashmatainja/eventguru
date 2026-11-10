'use client';

import dynamic from 'next/dynamic';
import { LoaderShell } from '@/components/ui/Loader';
import { TAGLINE } from '@/lib/layout';

// WebGL cannot render on the server, so the 3D showreel is loaded in the browser only.
// Until it arrives the hero shows the loading screen, with the page heading for search engines.
const Experience = dynamic(() => import('@/components/Experience'), {
  ssr: false,
  loading: () => (
    <div className="hero">
      <div className="hero__sticky">
        <h1 className="sr-only">EventGuru. {TAGLINE}.</h1>
        <LoaderShell percent={15} />
      </div>
    </div>
  ),
});

export function Hero() {
  return (
    <section id="top" aria-label="EventGuru showreel">
      <Experience />
    </section>
  );
}
