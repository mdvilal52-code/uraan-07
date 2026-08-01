import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* ---------------- Brand lotus logo mark ---------------- */
export function LotusMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="lotusGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9CE86" />
          <stop offset="55%" stopColor="#CFA23E" />
          <stop offset="100%" stopColor="#A5711D" />
        </linearGradient>
      </defs>
      <g stroke="url(#lotusGold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* centre petal */}
        <path d="M32 8c-4 8-4 20 0 30 4-10 4-22 0-30Z" fill="url(#lotusGold)" fillOpacity="0.18" />
        {/* inner side petals */}
        <path d="M32 38c-6-6-14-9-21-9 3 9 12 14 21 12" fill="url(#lotusGold)" fillOpacity="0.12" />
        <path d="M32 38c6-6 14-9 21-9-3 9-12 14-21 12" fill="url(#lotusGold)" fillOpacity="0.12" />
        {/* outer side petals */}
        <path d="M32 40C24 36 12 36 4 41c6 7 18 8 28 3" fill="none" />
        <path d="M32 40c8-4 20-4 28 1-6 7-18 8-28 3" fill="none" />
      </g>
    </svg>
  );
}

/* ---------------- Category icons ---------------- */
export function NecklaceIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M8 8c0 9 5.4 16 12 16s12-7 12-16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 24v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 36c2.8 0 5-2.4 5-5.2 0-2.9-2.2-4.8-5-4.8s-5 1.9-5 4.8c0 2.8 2.2 5.2 5 5.2Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function EarringIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M14 8c-2 3-2 6 0 8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M26 8c2 3 2 6 0 8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="14" cy="24" r="6" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.16" />
      <circle cx="26" cy="24" r="6" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.16" />
    </svg>
  );
}

export function RingIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M14 12l6-6 6 6-6 5-6-5Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="20" cy="26" r="9" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function BraceletIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className} {...props}>
      <ellipse cx="20" cy="20" rx="13" ry="10" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 11l4-4 4 4-4 3-4-3Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function PendantIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M9 9c0 7 4.4 12.5 11 14.5M31 9c0 7-4.4 12.5-11 14.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 22l5 6-5 6-5-6 5-6Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export function GemIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M12 8h16l6 8-14 16L6 16l6-8Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M6 16h28M12 8l4 8 4 16 4-16 4-8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

const map: Record<string, (p: IconProps) => JSX.Element> = {
  necklace: NecklaceIcon,
  earring: EarringIcon,
  ring: RingIcon,
  bracelet: BraceletIcon,
  pendant: PendantIcon,
  gem: GemIcon,
};

export function CategoryIcon({
  name,
  className,
  ...props
}: IconProps & { name: string }) {
  const Cmp = map[name] ?? GemIcon;
  return <Cmp className={className} {...props} />;
}
