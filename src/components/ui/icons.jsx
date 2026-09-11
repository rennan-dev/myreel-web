const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconPlus({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconX({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconCheck({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconReel({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function IconFilm({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M3 15h18M9.5 4v5m5-5v5M9.5 15v5m5-5v5" />
    </svg>
  );
}

export function IconTv({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="m8 3.5 4 4 4-4" />
    </svg>
  );
}

export function IconSpark({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m12 2.5 2.6 6.9 6.9 2.6-6.9 2.6L12 21.5l-2.6-6.9-6.9-2.6 6.9-2.6z" />
    </svg>
  );
}

export function IconStar({ className, filled = false }) {
  return (
    <svg {...svgProps} fill={filled ? "currentColor" : "none"} className={className}>
      <path d="m12 2.5 2.95 5.98 6.6.96-4.78 4.65 1.13 6.58L12 17.55l-5.9 3.12 1.13-6.58L2.45 9.44l6.6-.96z" />
    </svg>
  );
}

export function IconCalendar({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4" />
    </svg>
  );
}

export function IconClock({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconLogOut({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconPlay({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6.5 4.8v14.4a1 1 0 0 0 1.53.85l11.4-7.2a1 1 0 0 0 0-1.7L8.03 3.95a1 1 0 0 0-1.53.85Z" />
    </svg>
  );
}

export function IconArrowLeft({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M19 12H5m7-7-7 7 7 7" />
    </svg>
  );
}

export function IconGhost({ className }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M5 21V11a7 7 0 0 1 14 0v10" />
      <path d="M8.5 21h7" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
    </svg>
  );
}