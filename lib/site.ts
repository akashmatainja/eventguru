/**
 * All of the website's written content lives here, so it can be edited without touching layout.
 *
 * IMPORTANT: the contact details below are placeholders. Replace them with EventGuru's real
 * details before publishing. Lines left as an empty string are simply not shown.
 */
export const CONTACT = {
  email: 'hello@eventguru.example', // placeholder – enquiries from the form are addressed here
  phone: '', // e.g. '+91 98xxx xxxxx'
  whatsapp: '', // digits only with country code, e.g. '9198xxxxxxxx'
  address: '', // e.g. 'Street, Area, City – PIN'
  hours: '', // e.g. 'Monday to Saturday, 10am – 7pm'
};

export const NAV = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#builds', label: 'Signature builds' },
  { href: '#process', label: 'Process' },
  { href: '#contact', label: 'Contact' },
];

export const ABOUT = {
  eyebrow: 'About EventGuru',
  heading: 'We plan it, design it and build it, so you can simply be there.',
  body: [
    'EventGuru is an event design and management company. We take an occasion from the first conversation to the last guest leaving: the idea, the venue, the stage and décor, the light and sound, the people on the floor.',
    'The film at the top of this page is how we like to work. Before anything is built, you walk through your event in 3D, from the entrance gate to the stage to the photo corner, and change what you want while changing it is still easy.',
  ],
  points: [
    { title: 'One team, start to finish', text: 'Planning, design, production and show-day management under one roof and one point of contact.' },
    { title: 'Seen before it is built', text: 'Concepts are shown as 3D walk-throughs, so there are no surprises on the day.' },
    { title: 'Budgets in plain sight', text: 'An itemised plan that shows where the money goes and what each choice costs.' },
    { title: 'Calm on the day', text: 'A run sheet, a rehearsal and a show caller, so the evening runs to time.' },
  ],
};

export type IconName = 'rings' | 'plane' | 'podium' | 'spark' | 'booth' | 'stage' | 'beam' | 'mic';

export const SERVICES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'rings',
    title: 'Weddings & celebrations',
    text: 'Weddings, receptions, sangeet and mehendi evenings, anniversaries and milestone birthdays, planned and styled around your family.',
  },
  {
    icon: 'plane',
    title: 'Destination weddings',
    text: 'Venue scouting, guest travel and stays, local permissions and a full production team on site, wherever you choose to celebrate.',
  },
  {
    icon: 'podium',
    title: 'Corporate events & conferences',
    text: 'Conferences, annual days, award nights, dealer and distributor meets and team offsites, run to the minute.',
  },
  {
    icon: 'spark',
    title: 'Product launches & brand activations',
    text: 'Reveal moments, showroom openings, mall and roadshow activations designed to be remembered and photographed.',
  },
  {
    icon: 'booth',
    title: 'Exhibitions & trade shows',
    text: 'Stall design, fabrication and installation, with staffing and visitor management on the floor.',
  },
  {
    icon: 'stage',
    title: 'Stage, set & décor',
    text: 'Custom stages, entrance gates, themed sets, floral work and feature installations, designed and fabricated to your brief.',
  },
  {
    icon: 'beam',
    title: 'Light, sound & LED',
    text: 'Show lighting, line-array sound, LED walls and live camera feeds, specified by technicians who stay with your show.',
  },
  {
    icon: 'mic',
    title: 'Entertainment & hospitality',
    text: 'Artists, bands and emcees, plus catering coordination, guest welcome, transport and on-ground hospitality.',
  },
];

export const EVENT_TYPES = [
  'Weddings',
  'Receptions',
  'Sangeet & mehendi',
  'Birthdays',
  'Anniversaries',
  'Conferences',
  'Award nights',
  'Dealer meets',
  'Product launches',
  'Exhibitions',
  'Fashion shows',
  'Festive & cultural events',
];

export type BuildArt = 'gate' | 'stage' | 'diamond' | 'frame';

/** The four set pieces shown in the showreel. `at` is where each begins in the film (seconds). */
export const BUILDS: { art: BuildArt; title: string; text: string; at: number }[] = [
  {
    art: 'gate',
    title: 'The entrance gate',
    text: 'The first photograph every guest takes. Faceted gold wings with lattice screens and backlit stone, an LED face around the portal, and a red carpet leading through.',
    at: 4.4,
  },
  {
    art: 'stage',
    title: 'The main stage',
    text: 'A wide deck with a walk-out runway, LED walls framed by gold arches, a flown header ring and a full lighting rig overhead.',
    at: 10.2,
  },
  {
    art: 'diamond',
    title: 'The signature installation',
    text: 'One centrepiece that carries the theme of the evening. Here, a brilliant-cut framework of gold members and LED lines on a mirror-black plinth.',
    at: 17.4,
  },
  {
    art: 'frame',
    title: 'The photo opportunity',
    text: 'A walk-in frame lined with mirror foil, edged in light, with mirror balls and standing letters. Built to look its best on a phone camera.',
    at: 23.2,
  },
];

export const PROCESS = [
  { title: 'Tell us about it', text: 'The occasion, the date, the guest count and the feeling you are after. A short call or a message is enough to begin.' },
  { title: 'See the concept', text: 'We come back with a theme, a layout and a 3D preview of the key spaces, together with an itemised estimate.' },
  { title: 'Lock the plan', text: 'Venue, vendors, timelines and budget are agreed in writing. You get one schedule and one person to call.' },
  { title: 'Build and rehearse', text: 'Sets are fabricated, tested and installed. Light, sound and screens are programmed and run through before doors open.' },
  { title: 'Enjoy the day', text: 'Our crew runs the floor from the first arrival to the last goodbye, and clears the venue afterwards.' },
];

export const ENQUIRY_EVENT_OPTIONS = [
  'Wedding or reception',
  'Destination wedding',
  'Birthday or anniversary',
  'Corporate event or conference',
  'Product launch or activation',
  'Exhibition or trade show',
  'Stage, set or décor only',
  'Something else',
];
