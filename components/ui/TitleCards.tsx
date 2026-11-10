import { DESCRIPTOR, TAGLINE } from '@/lib/layout';

/** The EventGuru wordmark as live text: "Event" light, "Guru" bold. */
export function Wordmark() {
  return (
    <>
      Event<strong>Guru</strong>
    </>
  );
}

/**
 * On-screen titles for the showreel. These start hidden; the master timeline animates them
 * (see components/animations/masterTimeline.ts), so they stay in step with the 3D film.
 * The closing card carries the page's main calls to action and stays on screen.
 */
export function TitleCards() {
  return (
    <>
      <div className="title title-intro" aria-hidden="true">
        <p className="line title__brand">{DESCRIPTOR}</p>
        <p className="line title__event">
          <Wordmark />
        </p>
      </div>

      <div className="title title-final">
        <h1 className="line title__event">
          <Wordmark />
        </h1>
        <p className="line title__tagline">{TAGLINE}</p>
        <p className="line title__actions">
          <a className="button button--solid" href="#contact">
            Plan your event
          </a>
          <a className="button" href="#services">
            Explore services
          </a>
        </p>
      </div>
    </>
  );
}
