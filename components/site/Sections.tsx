import { ABOUT, BUILDS, CONTACT, EVENT_TYPES, NAV, PROCESS, SERVICES } from '@/lib/site';
import { TAGLINE } from '@/lib/layout';
import { Wordmark } from '@/components/ui/TitleCards';
import { BuildDrawing, ServiceIcon } from './Art';
import { Reveal } from './Reveal';
import { WatchButton } from './WatchButton';
import { EnquiryForm } from './EnquiryForm';

function SectionHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <Reveal className="section__head">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p className="section__intro">{intro}</p>}
    </Reveal>
  );
}

export function About() {
  return (
    <section id="about" className="section">
      <div className="wrap about">
        <Reveal className="about__lead">
          <p className="eyebrow">{ABOUT.eyebrow}</p>
          <h2>{ABOUT.heading}</h2>
        </Reveal>
        <Reveal className="about__body" delay={80}>
          {ABOUT.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
        <ul className="points">
          {ABOUT.points.map((point, i) => (
            <li key={point.title}>
              <Reveal delay={i * 70}>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className="section section--raised">
      <div className="wrap">
        <SectionHead
          eyebrow="What we do"
          title="Every part of the event, handled by one team"
          intro="Take the whole event or only the part you need. Each service below can stand on its own or join the others."
        />
        <ul className="services">
          {SERVICES.map((service, i) => (
            <li key={service.title}>
              <Reveal className="service" delay={(i % 4) * 60}>
                <ServiceIcon name={service.icon} />
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="types">
          <h3 className="eyebrow">Occasions we plan</h3>
          <ul>
            {EVENT_TYPES.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function Builds() {
  return (
    <section id="builds" className="section">
      <div className="wrap">
        <SectionHead
          eyebrow="Signature builds"
          title="Four pieces that make a venue feel like an occasion"
          intro="These are the set pieces in the film at the top of the page. Each one is designed for your theme, previewed in 3D and then built."
        />
        <ol className="builds">
          {BUILDS.map((build, i) => (
            <li key={build.title}>
              <Reveal className="build" delay={(i % 2) * 80}>
                <div className="build__frame">
                  <BuildDrawing art={build.art} />
                </div>
                <div className="build__text">
                  <p className="build__number" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3>{build.title}</h3>
                  <p>{build.text}</p>
                  <WatchButton at={build.at} label={build.title} />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section id="process" className="section section--raised">
      <div className="wrap">
        <SectionHead eyebrow="How we work" title="From first call to final bow, in five steps" />
        <ol className="process">
          {PROCESS.map((step, i) => (
            <li key={step.title}>
              <Reveal className="step" delay={i * 60}>
                <p className="step__number" aria-hidden="true">
                  {i + 1}
                </p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  const details = [
    CONTACT.phone && { label: 'Call', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}` },
    CONTACT.whatsapp && { label: 'WhatsApp', value: 'Message us', href: `https://wa.me/${CONTACT.whatsapp}` },
    CONTACT.email && { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.address && { label: 'Visit', value: CONTACT.address },
    CONTACT.hours && { label: 'Hours', value: CONTACT.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="section">
      <div className="wrap contact">
        <div className="contact__intro">
          <Reveal>
            <p className="eyebrow">Start planning</p>
            <h2>Tell us about your event</h2>
            <p className="section__intro">
              Share the occasion, the date and roughly how many guests. We will come back with ideas and an estimate.
            </p>
          </Reveal>
          {details.length > 0 && (
            <Reveal delay={80}>
              <dl className="contact__details">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.href ? <a href={d.href}>{d.value}</a> : d.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
        <Reveal delay={120}>
          <EnquiryForm />
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div>
          <p className="site-footer__logo">
            <Wordmark />
          </p>
          <p className="site-footer__tagline">{TAGLINE}</p>
        </div>
        <nav aria-label="Footer">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <p className="site-footer__legal">© {new Date().getFullYear()} EventGuru. All rights reserved.</p>
      </div>
    </footer>
  );
}
