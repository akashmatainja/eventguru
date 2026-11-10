import type { BuildArt, IconName } from '@/lib/site';

const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Small line icons for the services grid. */
export function ServiceIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, JSX.Element> = {
    rings: (
      <>
        <circle cx="9.5" cy="14" r="5.5" />
        <circle cx="15.5" cy="14" r="5.5" />
        <path d="m8 5 1.5-2h1L12 5l-1.5 2h-1L8 5Z" />
      </>
    ),
    plane: <path d="M3 13.5 21 4l-5.5 16-3.2-6.6L3 13.5Zm9.3-.1L21 4" />,
    podium: (
      <>
        <path d="M5 9h14l-1.5 4h-11L5 9Zm3.5 4v7m7-7v7M7 20h10" />
        <path d="M12 9V5.5a2 2 0 0 1 2-2" />
      </>
    ),
    spark: <path d="M12 3v5m0 8v5M3 12h5m8 0h5M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" />,
    booth: <path d="M4 20V8l8-4 8 4v12M4 11h16M9 20v-5h6v5M3 20h18" />,
    stage: <path d="M3 17h18v3H3v-3Zm2 0V6h14v11M8 17v-7a4 4 0 0 1 8 0v7" />,
    beam: (
      <>
        <path d="M9 3h6l1 4H8l1-4Z" />
        <path d="M8.5 7 4 20m11.500-13L20 20M12 7v13" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M6 11.500a6 6 0 0 0 12 0M12 17.500V21m-3 0h6" />
      </>
    ),
  };
  return (
    <svg className="service__icon" width="34" height="34" viewBox="0 0 24 24" strokeWidth="1.2" {...line} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/** Line drawings of the four set pieces from the showreel. */
export function BuildDrawing({ art }: { art: BuildArt }) {
  const drawings: Record<BuildArt, JSX.Element> = {
    gate: (
      <>
        <path d="M70 92V30h60v62M82 92V46h36v46" />
        <path d="M70 30 22 50l-6 42h54M70 60 44 66l-10 26M22 50l22 16M44 66l26-36" />
        <path d="M130 30l48 20 6 42h-54M130 60l26 6 10 26M178 50l-22 16M156 66l-26-36" />
        <path d="M86 92 74 108h52l-12-16" />
        <path d="M88 36h24v6H88z" />
      </>
    ),
    stage: (
      <>
        <path d="M14 84h172v10H14zM84 94h32v14H84z" />
        <path d="M60 84V34h80v50M72 84V54a28 28 0 0 1 56 0v30M84 84V60a16 16 0 0 1 32 0v24" />
        <path d="M22 84V40h26v44M152 84V40h26v44" />
        <path d="M10 22h180M30 22l10 30M170 22l-10 30M78 22l-6 22M122 22l6 22" />
        <ellipse cx="100" cy="24" rx="16" ry="4" />
      </>
    ),
    diamond: (
      <>
        <path d="M66 26h68l34 24-68 54L32 50l34-24Z" />
        <path d="M32 50h136M66 26 52 50l48 54 48-54-14-24M84 26 76 50l24 54 24-54-8-24M100 26v24" />
        <ellipse cx="100" cy="106" rx="44" ry="7" />
      </>
    ),
    frame: (
      <>
        <path d="M26 18h148v84H26zM44 32h112v58H44zM26 18l18 14M174 18l-18 14M26 102l18-12M174 102l-18-12" />
        <path d="M78 46h44l12 8-34 30-34-30 12-8ZM66 54h68" />
        <circle cx="58" cy="44" r="6" />
        <circle cx="146" cy="48" r="7" />
        <path d="M58 32v6M146 32v9" />
      </>
    ),
  };
  return (
    <svg className="build__art" viewBox="0 0 200 120" strokeWidth="1.1" {...line} aria-hidden="true">
      {drawings[art]}
    </svg>
  );
}
