# EventGuru

Website for EventGuru, an event design and management company. The page opens with a full-screen
cinematic 3D showreel (one continuous 35-second camera move through an entrance gate, a main stage,
a diamond installation and a photo opportunity) and continues into the site content: About,
Services, Signature builds, Process and an enquiry form.

Built with Next.js (App Router, TypeScript), React Three Fiber, drei, GSAP + ScrollTrigger,
@react-three/postprocessing and Zustand.

## Status – please read

- **The 3D showreel has been type- and syntax-checked but has not yet been run in a browser.** It
  was written in an environment with no package registry access, so `npm install` could not be
  executed there. Expect a first session checking it on screen and tuning light levels (see
  "Tuning"). The content sections, the EventGuru sign and the LED wall artwork were rendered and
  checked in a real browser.
- **Contact details are placeholders.** Edit `CONTACT` in `lib/site.ts` before publishing. Phone,
  WhatsApp, address and hours are blank and stay hidden until filled in.
- **All written copy is a first draft** (`lib/site.ts`). Check that every service and promise
  matches what EventGuru actually offers.
- **The enquiry form has no server.** Submitting opens the visitor's email app with the enquiry
  filled in, addressed to `CONTACT.email`. To receive enquiries directly, replace `send` in
  `components/site/EnquiryForm.tsx` with a POST to a form service or API route.
- **No portfolio, testimonials or statistics sections are included**, because those need real
  photographs, real client words and real numbers.
- **The EventGuru sign is typeset, not a designed logo** (`drawWordmark` in `lib/textures.ts`).
- Every structure in the film is real 3D geometry generated in code. It is detailed and
  physically shaded, but it is procedural set-building, not photoreal scanned assets.

## Run it

Requires Node.js 18.17 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm run start        # serves the production build on port 3000
```

Deploy: push the folder to a Git repository and import it in Vercel (zero configuration), or run
`npm run build && npm run start` behind any Node host.

## Editing the website content

Everything written on the page is in **`lib/site.ts`**: contact details, navigation, the About
text, the services, the list of occasions, the four signature builds, the process steps and the
enquiry form's event options. The name, descriptor and tagline are in `lib/layout.ts`.

## The showreel

| Time | Scene | What happens |
| --- | --- | --- |
| 0–4s | Introduction | Black. A distant gold glow, dust, then a brilliant-cut diamond. EventGuru title. |
| 4–10s | Entrance gate | Light runs along the faceted side structures, the LED face powers on, the carpet warms, camera goes through the portal. |
| 10–17s | Main stage | Crane up; four gold arches light front to back; LED walls come on; beams sweep; the centre screen shows the EventGuru sign. |
| 17–23s | Diamond installation | The gold framework lights from the plinth upward; sign and 3D EVENTGURU lettering appear; slow orbit. |
| 23–28s | Photo opportunity | Mirror-foil box, LED edges, neon diamond, mirror balls, sign and gold lettering. |
| 28–35s | Finale | Back to the diamond, everything to full, slow pull-back. The film holds on its last frame behind the name, tagline and the two call-to-action buttons. |

- The hero is a long pinned section: the film auto-plays and scrolls the page to match,
  while scrolling by hand scrubs it (auto-play resumes after a pause).
- At the end the film holds on its last frame for a few seconds, then loops.
- Rendering and playback pause while the hero is scrolled out of view.
- The "Watch in the film" buttons in the Signature builds section jump to that scene.

## Project structure

```
app/                    layout, page, global styles
components/
  site/                 the website: Header, Hero, Sections (About, Services, Builds, Process,
                        Contact, Footer), EnquiryForm, WatchButton, Reveal, Art (line drawings)
  Experience.tsx        the hero: Canvas + titles + controls, adaptive quality
  scene/                3D set pieces and rendering
    Venue.tsx             studio reflections, haze, reflective floor
    IntroDiamond.tsx      Scene 1
    EntranceGate.tsx      Scene 2
    MainStage.tsx         Scene 3 (platform, LED walls, arches, truss, beams)
    DiamondInstallation.tsx  Scenes 4 and 6
    PhotoOpp.tsx          Scene 5
    BackdropWall.tsx      fluted wall with uplights
    Tubes.tsx             instanced members + the progressive "GlowFrame"
    BrandLettering.tsx    3D EVENTGURU lettering
    LogoPlaque.tsx        illuminated EventGuru sign
    ModelSlot.tsx         GLB override (Draco / Meshopt / KTX2)
    Zone.tsx              stops drawing off-camera areas
    Effects.tsx           AO, depth of field, bloom, grade, tone mapping
  camera/               cameraPath.ts (the shots) and CameraRig.tsx
  animations/           masterTimeline.ts (GSAP) and Director.tsx (scroll scrub / seek)
  ui/                   Loader, TitleCards, Controls
lib/                    site content, geometry builders, materials, LED canvas artwork,
                        quality tiers, audio, layout
store/                  useShow.ts (Zustand UI state) and fx.ts (per-frame animation channels)
public/models/          optional GLB overrides (see README there)
public/audio/           optional soundtrack (see README there)
```

## How the animation is wired

- `components/animations/masterTimeline.ts` is the single GSAP timeline. It tweens plain numbers
  in `store/fx.ts` (for example `gateGlow`, `diamondReveal`) and the DOM title cards.
- 3D components read those numbers inside `useFrame`. No React state changes during playback.
- `fx.time` is the playhead. `CameraRig` samples the spline in `cameraPath.ts` at that time.

## Tuning

- **Camera:** edit the `SHOTS` list in `components/camera/cameraPath.ts`.
- **Timing of lights and text:** edit the `ch(...)` lines in `masterTimeline.ts`.
- **Brightness:** light intensities sit next to each `spotLight` in the scene files; overall
  reflected light is in `Venue.tsx`; bloom, grade and vignette are in `Effects.tsx`. If something
  looks blown out, lower bloom `intensity` first.
- **Positions of the set pieces:** `lib/layout.ts`.

## Assets

- **Logo:** to use a designed logo in the film, draw your image inside `drawWordmark` in
  `lib/textures.ts` (it feeds the 3D signs and every LED wall), and replace the `Wordmark`
  component in `components/ui/TitleCards.tsx` for the header, titles and footer.
- **GLB models:** none are required. To swap a procedural set piece for a supplied model, set its
  path in `lib/assets.ts`.
- **Sound:** off by default. The sound button plays `public/audio/eventguru.mp3` if you add one,
  otherwise a soft synthesised ambience.
- **Fonts:** Cinzel, Cormorant Garamond and Jost load from Google Fonts with serif fallbacks.

## Performance

- Two quality tiers (`lib/quality.ts`), chosen from device signals and lowered automatically by
  `PerformanceMonitor` if the frame rate drops. Phones get the light tier: no mirror-floor render,
  shadows, AO, depth of field or glass transmission, and fewer particles and beams.
- The canvas stops rendering entirely while the hero is off screen.
- Instanced geometry for repeated members; off-camera zones are not drawn; shadow maps and LED
  canvases stop updating when not visible; all shaders compile behind the loading screen.
