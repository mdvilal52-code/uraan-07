/**
 * Generates elegant SVG product/imagery assets into public/images.
 * Self-authored, dependency-free. Re-run with: npm run gen:images
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images");
mkdirSync(OUT, { recursive: true });

const W = 1000;
const C = 500;

/* ---------- shared building blocks ---------- */

const defs = `
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F4E3B8"/>
      <stop offset="42%" stop-color="#CFA23E"/>
      <stop offset="100%" stop-color="#8A5E17"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8ECC8"/>
      <stop offset="100%" stop-color="#C99B34"/>
    </linearGradient>
    <radialGradient id="diamond" cx="38%" cy="34%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#EAF2F6"/>
      <stop offset="100%" stop-color="#C3D2DA"/>
    </radialGradient>
    <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBF4E6"/>
      <stop offset="55%" stop-color="#EFDFBF"/>
      <stop offset="100%" stop-color="#E4CF9F"/>
    </linearGradient>
    <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCF7EC"/>
      <stop offset="100%" stop-color="#F0E2C8"/>
    </linearGradient>
    <radialGradient id="velvet" cx="42%" cy="34%" r="80%">
      <stop offset="0%" stop-color="#22503C"/>
      <stop offset="60%" stop-color="#123125"/>
      <stop offset="100%" stop-color="#0A1E17"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>`;

function bg(kind) {
  if (kind === "velvet") {
    return `<rect width="${W}" height="${W}" fill="url(#velvet)"/>
      <ellipse cx="${C}" cy="360" rx="360" ry="300" fill="#E9CE86" opacity="0.10" filter="url(#soft)"/>`;
  }
  if (kind === "cream") {
    return `<rect width="${W}" height="${W}" fill="url(#cream)"/>
      <ellipse cx="330" cy="300" rx="380" ry="320" fill="#ffffff" opacity="0.45" filter="url(#soft)"/>`;
  }
  // marble
  return `<rect width="${W}" height="${W}" fill="url(#marble)"/>
    <g stroke="#ffffff" stroke-opacity="0.35" fill="none" stroke-width="3" filter="url(#soft)">
      <path d="M-20 260 C 220 200, 360 360, 640 250 S 980 300, 1040 210"/>
      <path d="M-20 640 C 260 560, 420 720, 700 600 S 980 660, 1040 560"/>
    </g>
    <ellipse cx="320" cy="300" rx="360" ry="300" fill="#ffffff" opacity="0.30" filter="url(#soft)"/>`;
}

function sparkles(color = "#FBEFC8") {
  const star = (x, y, s, o) =>
    `<g transform="translate(${x} ${y})" opacity="${o}">
       <path d="M0 ${-s} C ${s * 0.18} ${-s * 0.18}, ${s * 0.18} ${-s * 0.18}, ${s} 0
                C ${s * 0.18} ${s * 0.18}, ${s * 0.18} ${s * 0.18}, 0 ${s}
                C ${-s * 0.18} ${s * 0.18}, ${-s * 0.18} ${s * 0.18}, ${-s} 0
                C ${-s * 0.18} ${-s * 0.18}, ${-s * 0.18} ${-s * 0.18}, 0 ${-s} Z"
             fill="${color}"/>
     </g>`;
  return (
    star(150, 170, 26, 0.9) +
    star(840, 250, 18, 0.8) +
    star(800, 780, 30, 0.75) +
    star(190, 760, 16, 0.7)
  );
}

/* faceted round diamond */
function gem(cx, cy, r, color = "url(#diamond)") {
  let facets = "";
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    facets += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * r).toFixed(1)}" y2="${(cy + Math.sin(a) * r).toFixed(1)}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.4"/>`;
  }
  let table = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    table += `${(cx + Math.cos(a) * r * 0.5).toFixed(1)},${(cy + Math.sin(a) * r * 0.5).toFixed(1)} `;
  }
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#ffffff" stroke-opacity="0.85" stroke-width="${(r * 0.05).toFixed(1)}"/>
    ${facets}
    <polygon points="${table.trim()}" fill="#ffffff" fill-opacity="0.9"/>
    <circle cx="${(cx - r * 0.28).toFixed(1)}" cy="${(cy - r * 0.28).toFixed(1)}" r="${(r * 0.16).toFixed(1)}" fill="#ffffff"/>`;
}

/* gold prong setting behind a gem */
function prongs(cx, cy, r) {
  let p = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    p += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.14).toFixed(1)}" fill="url(#gold)"/>`;
  }
  return p;
}

/* ---------- motifs ---------- */

function necklace(accent) {
  // quadratic strand P0 (left) -> P1 (control bottom) -> P2 (right)
  const P0 = [240, 330], P1 = [C, 720], P2 = [760, 330];
  const B = (t) => {
    const u = 1 - t;
    return [
      u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0],
      u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1],
    ];
  };
  let beads = "";
  for (let i = 0; i <= 34; i++) {
    const [x, y] = B(i / 34);
    beads += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="url(#gold)"/>`;
  }
  const [bx, by] = B(0.5);
  return `
    <path d="M${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}" fill="none" stroke="url(#goldSoft)" stroke-width="4" opacity="0.7"/>
    ${beads}
    <path d="M${bx} ${by} l -34 40 l 34 74 l 34 -74 z" fill="url(#gold)" opacity="0.9"/>
    ${prongs(bx, by + 78, 52)}
    ${gem(bx, by + 78, 46, accent)}`;
}

function ring(accent) {
  const cx = C, cy = 620;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="150" ry="118" fill="none" stroke="url(#gold)" stroke-width="30"/>
    <ellipse cx="${cx}" cy="${cy}" rx="150" ry="118" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="6"/>
    <path d="M${cx - 66} ${cy - 96} L ${cx + 66} ${cy - 96} L ${cx + 30} ${cy - 190} L ${cx - 30} ${cy - 190} Z" fill="url(#gold)"/>
    ${prongs(cx, cy - 230, 74)}
    ${gem(cx, cy - 230, 66, accent)}`;
}

function earrings(accent) {
  const stud = (cx) => `
    <line x1="${cx}" y1="300" x2="${cx}" y2="430" stroke="url(#gold)" stroke-width="7"/>
    ${prongs(cx, 470, 62)}
    ${gem(cx, 470, 54, accent)}
    <g>${[0, 1, 2].map((i) => gem(cx - 40 + i * 40, 600, 20, accent)).join("")}</g>
    <path d="M${cx - 60} 540 Q ${cx} 600 ${cx + 60} 540" fill="none" stroke="url(#gold)" stroke-width="6"/>`;
  return stud(360) + stud(640);
}

function jhumka() {
  const bell = (cx) => `
    <line x1="${cx}" y1="300" x2="${cx}" y2="400" stroke="url(#gold)" stroke-width="7"/>
    <circle cx="${cx}" cy="410" r="26" fill="url(#gold)"/>
    <path d="M${cx - 96} 470 Q ${cx} 380 ${cx + 96} 470 L ${cx + 70} 560 Q ${cx} 590 ${cx - 70} 560 Z" fill="url(#gold)"/>
    <path d="M${cx - 96} 470 Q ${cx} 380 ${cx + 96} 470" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="5"/>
    ${[...Array(5)].map((_, i) => `<circle cx="${cx - 80 + i * 40}" cy="600" r="16" fill="url(#goldSoft)"/>`).join("")}`;
  return bell(360) + bell(640);
}

function bracelet(accent) {
  const cx = C, cy = C;
  let gems = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    gems += gem(cx + Math.cos(a) * 230, cy + Math.sin(a) * 150, 22, accent);
  }
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="230" ry="150" fill="none" stroke="url(#gold)" stroke-width="26"/>
    <ellipse cx="${cx}" cy="${cy}" rx="230" ry="150" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="6"/>
    ${gems}`;
}

function heartPendant(accent) {
  const cx = C, cy = 470;
  const heart = `M${cx} ${cy + 150}
    C ${cx - 230} ${cy - 20}, ${cx - 130} ${cy - 210}, ${cx} ${cy - 60}
    C ${cx + 130} ${cy - 210}, ${cx + 230} ${cy - 20}, ${cx} ${cy + 150} Z`;
  return `
    <path d="M300 250 Q ${cx} 360 700 250" fill="none" stroke="url(#gold)" stroke-width="6"/>
    <path d="${heart}" fill="none" stroke="url(#gold)" stroke-width="26"/>
    <path d="${heart}" fill="url(#gold)" opacity="0.12"/>
    ${prongs(cx, cy + 20, 74)}
    ${gem(cx, cy + 20, 66, accent)}`;
}

function teardrop(accent) {
  const cx = C, cy = 560;
  return `
    <line x1="${cx}" y1="250" x2="${cx}" y2="360" stroke="url(#gold)" stroke-width="6"/>
    <circle cx="${cx}" cy="360" r="22" fill="url(#gold)"/>
    <path d="M${cx} 400 C ${cx - 150} 470, ${cx - 120} 720, ${cx} 720 C ${cx + 120} 720, ${cx + 150} 470, ${cx} 400 Z" fill="url(#gold)"/>
    ${gem(cx, 570, 92, accent)}`;
}

function gemsCluster() {
  const colors = ["#C6303B", "#2E8B57", "#2F6FB0", "#7B4BB7", "#E0A21C", "url(#diamond)", "#C6303B", "#2E8B57"];
  const pts = [
    [360, 360], [560, 330], [690, 470], [420, 520], [600, 560],
    [500, 470], [330, 560], [680, 640],
  ];
  return pts.map((p, i) => gem(p[0], p[1], 66, colors[i % colors.length])).join("");
}

function editorial() {
  const cx = C;
  return `
    <path d="M250 1000 L250 780 Q ${cx} 640 750 780 L750 1000 Z" fill="#E9CE86" opacity="0.10"/>
    <path d="M330 700 Q ${cx} 560 670 700" fill="none" stroke="#0E271E" stroke-width="60" opacity="0.5"/>
    <path d="M360 640 Q ${cx} 760 640 640" fill="none" stroke="url(#gold)" stroke-width="7"/>
    ${[...Array(16)].map((_, i) => {
      const t = i / 15;
      const x = 360 + (640 - 360) * t;
      const y = 640 + Math.sin(t * Math.PI) * 120;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="url(#gold)"/>`;
    }).join("")}
    ${gem(cx, 758, 34)}`;
}

const motifs = {
  necklace,
  ring,
  earrings,
  jhumka: () => jhumka(),
  bracelet,
  heartPendant,
  teardrop,
  gems: () => gemsCluster(),
  editorial: () => editorial(),
};

function build(motif, kind, accent) {
  const spark = kind === "velvet" ? sparkles("#F4E3B8") : sparkles("#ffffff");
  const inner = motifs[motif](accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}">
  ${defs}
  ${bg(kind)}
  ${spark}
  ${inner}
  <rect width="${W}" height="${W}" fill="url(#glow)" opacity="0.06"/>
</svg>\n`;
}

const DIAMOND = "url(#diamond)";
const EMERALD = "#2E8B57";

const files = [
  ["necklace.svg", "necklace", "marble", DIAMOND],
  ["necklace-2.svg", "necklace", "marble", DIAMOND],
  ["earrings.svg", "earrings", "cream", DIAMOND],
  ["earrings-2.svg", "jhumka", "marble", DIAMOND],
  ["ring.svg", "ring", "cream", DIAMOND],
  ["ring-2.svg", "ring", "marble", EMERALD],
  ["bracelet.svg", "bracelet", "cream", DIAMOND],
  ["bracelet-2.svg", "bracelet", "marble", EMERALD],
  ["heart-pendant.svg", "heartPendant", "velvet", DIAMOND],
  ["pendant.svg", "teardrop", "cream", DIAMOND],
  ["collection-1.svg", "necklace", "velvet", DIAMOND],
  ["collection-2.svg", "necklace", "velvet", DIAMOND],
  ["collection-3.svg", "heartPendant", "velvet", DIAMOND],
  ["collection-4.svg", "ring", "cream", DIAMOND],
  ["collection-5.svg", "bracelet", "velvet", DIAMOND],
  ["collection-royal.svg", "necklace", "velvet", DIAMOND],
  ["collection-modern.svg", "ring", "velvet", EMERALD],
  ["collection-bridal.svg", "jhumka", "velvet", DIAMOND],
  ["gemstones.svg", "gems", "marble", DIAMOND],
  ["editorial.svg", "editorial", "velvet", DIAMOND],
  ["hero.svg", "necklace", "cream", DIAMOND],
];

for (const [name, motif, kind, accent] of files) {
  writeFileSync(join(OUT, name), build(motif, kind, accent));
}

console.log(`Generated ${files.length} images into public/images`);
