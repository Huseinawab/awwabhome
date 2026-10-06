import type { ReactNode } from "react";
import { resolveCatState, type CatState } from "@/lib/branding/catStates";

// One vector character, five poses. Head, ears, face and palette are shared; only body, tail and expression change.
const BODY = "var(--cat-body, #C2703D)";
const ACCENT = "var(--cat-accent, #D9A441)";
const INK = "var(--cat-ink, #4A2E22)";
const CREAM = "var(--cat-cream, #FBF8F2)";

type Eyes = "closed" | "open" | "happy";

function Head({ x, y, eyes, smile }: { x: number; y: number; eyes: Eyes; smile?: boolean }) {
  const eye = (dx: number) =>
    eyes === "open" ? <circle cx={dx} cy={-0.5} r={1.6} fill={INK} /> :
    eyes === "closed" ? <path d={`M${dx - 2.5},-0.5 q2.5,2 5,0`} stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" /> :
    <path d={`M${dx - 2.5},0.5 q2.5,-2.6 5,0`} stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-9,-3 L-8,-14 L-1.5,-9 Z M9,-3 L8,-14 L1.5,-9 Z" fill={BODY} stroke={BODY} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M-7,-6 L-6.6,-11 L-3.6,-8.6 Z M7,-6 L6.6,-11 L3.6,-8.6 Z" fill={ACCENT} stroke={ACCENT} strokeWidth={1} strokeLinejoin="round" />
      <circle r={10} fill={BODY} />
      <ellipse cy={4.2} rx={5} ry={3.6} fill={CREAM} />
      {eye(-3.6)}
      {eye(3.6)}
      <path d="M-1.1,2.6 L1.1,2.6 L0,3.9 Z" fill={INK} stroke={INK} strokeWidth={0.6} strokeLinejoin="round" />
      {smile && <path d="M-2,5 q1,1.3 2,0 q1,1.3 2,0" stroke={INK} strokeWidth={0.9} fill="none" strokeLinecap="round" />}
    </g>
  );
}

const tail = (d: string) => <path d={d} stroke={BODY} strokeWidth={5} fill="none" strokeLinecap="round" />;
const legs = (y: number, h: number) => [21, 27, 41, 47].map((x) => <rect key={x} x={x} y={y} width={5} height={h} rx={2.5} fill={BODY} />);

const POSES: Record<CatState, ReactNode> = {
  resting: (
    <>
      <ellipse cx={36} cy={48} rx={18} ry={9.5} fill={BODY} />
      {tail("M53,50 C58,58 42,60 26,57.5")}
      <Head x={19} y={46} eyes="closed" />
    </>
  ),
  waking: (
    <>
      {tail("M48,53 C57,53 60,47 58,40")}
      <ellipse cx={35} cy={46} rx={15} ry={10.5} fill={BODY} />
      <ellipse cx={24} cy={55.5} rx={5} ry={2.6} fill={BODY} />
      <Head x={26} y={33} eyes="open" />
    </>
  ),
  steady: (
    <>
      {tail("M41,55 C53,55 56,43 51,34")}
      <ellipse cx={32} cy={44} rx={12} ry={12.5} fill={BODY} />
      <ellipse cx={27} cy={56} rx={4.5} ry={2.6} fill={BODY} />
      <ellipse cx={37} cy={56} rx={4.5} ry={2.6} fill={BODY} />
      <ellipse cx={32} cy={42} rx={5} ry={7} fill={CREAM} opacity={0.55} />
      <Head x={32} y={24} eyes="open" smile />
    </>
  ),
  growing: (
    <>
      {tail("M49,37 C57,33 59,24 55,16")}
      {legs(39, 18)}
      <ellipse cx={35} cy={38} rx={16} ry={8} fill={BODY} />
      <Head x={20} y={26} eyes="open" smile />
    </>
  ),
  thriving: (
    <>
      {tail("M49,33 C54,24 51,14 55,7")}
      {legs(35, 22)}
      <ellipse cx={35} cy={34} rx={16} ry={8} fill={BODY} />
      <Head x={19} y={19} eyes="happy" smile />
    </>
  ),
};

const SIZES = { xs: 24, sm: 32, md: 96, lg: 144 } as const;

export function AwwabCat({ lifeScore, state, size = "md", className = "", title }: {
  lifeScore?: number | null; state?: CatState; size?: keyof typeof SIZES | number; className?: string; title?: string | undefined;
}) {
  const s = state ?? resolveCatState(lifeScore);
  const px = typeof size === "number" ? size : SIZES[size];
  return (
    <svg viewBox="0 0 64 64" width={px} height={px} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} data-cat-state={s}>
      {POSES[s]}
    </svg>
  );
}

/** Rounded app-icon tile (cream background) around the cat. */
export function AwwabAppIcon({ lifeScore, state, size = 64 }: { lifeScore?: number | null; state?: CatState; size?: number }) {
  const s = state ?? resolveCatState(lifeScore);
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <rect width={64} height={64} rx={14} fill="#F7F2E9" />
      <g transform="translate(5 5) scale(0.84)">{POSES[s]}</g>
    </svg>
  );
}
