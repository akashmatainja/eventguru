'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { TAGLINE } from '@/lib/layout';
import { SceneRoot } from '@/components/scene/SceneRoot';
import { Director } from '@/components/animations/Director';
import { Loader } from '@/components/ui/Loader';
import { TitleCards, Wordmark } from '@/components/ui/TitleCards';
import { Controls } from '@/components/ui/Controls';

/**
 * The hero: a full-screen 3D showreel with its titles and controls.
 * Client-only (loaded with ssr: false). The hero is a tall track whose contents
 * stay pinned, so scrolling through it scrubs the film before the page continues.
 */
export default function Experience() {
  const scope = useRef<HTMLDivElement>(null);
  const quality = useShow((s) => s.quality);
  const setQuality = useShow((s) => s.setQuality);
  const inView = useShow((s) => s.inView);
  const settings = QUALITY[quality];
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, settings.dpr[1]));
  const [supported] = useState(() => Boolean(document.createElement('canvas').getContext('webgl2')));

  // Keep resolution inside the active tier's range when the tier changes.
  useEffect(() => {
    setDpr((d) => Math.min(d, settings.dpr[1]));
  }, [settings]);

  // Stop rendering and playback while the hero is scrolled out of view.
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => useShow.getState().setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [supported]);

  // Adaptive quality: ease resolution down first, then drop to the light tier.
  const decline = () => {
    if (dpr - 0.25 >= settings.dpr[0]) setDpr(dpr - 0.25);
    else setQuality('low');
  };
  const incline = () => setDpr(Math.min(settings.dpr[1], window.devicePixelRatio || 1, dpr + 0.25));

  if (!supported) {
    return (
      <div className="hero hero--static">
        <div className="title title-final title--static">
          <h1 className="title__event">
            <Wordmark />
          </h1>
          <p className="title__tagline">{TAGLINE}</p>
          <p className="title__actions">
            <a className="button button--solid" href="#contact">
              Plan your event
            </a>
            <a className="button" href="#services">
              Explore services
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scope} className="hero hero--scroll">
      <div className="hero__sticky">
        <div className="stage-canvas" aria-hidden="true">
          <Canvas
            flat // tone mapping is applied once, in the post-processing chain
            frameloop={inView ? 'always' : 'never'}
            dpr={dpr}
            shadows={settings.shadows ? 'soft' : false}
            gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
            camera={{ fov: 40, near: 0.1, far: 400, position: [0, 2.4, 88] }}
          >
            <PerformanceMonitor onDecline={decline} onIncline={incline} flipflops={3} onFallback={() => setQuality('low')} />
            <SceneRoot />
          </Canvas>
        </div>

        <p className="sr-only">
          A 35-second 3D showreel: a diamond appears out of darkness, then the camera travels through an LED entrance
          gate, over a main stage, around a diamond installation and past a photo opportunity, ending on the EventGuru
          name.
        </p>
        <TitleCards />
        <Controls />
        <Loader />
      </div>
      <Director scope={scope} />
    </div>
  );
}
