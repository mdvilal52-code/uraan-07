# Product imagery

The storefront currently renders elegant **gradient placeholders**
(`components/ProductImage.tsx`) so the layout is pixel-accurate without
photography.

To use real HD photos:

1. Drop optimized images here in `/public/images/` using the filenames
   referenced in `data/jewelleryData.ts` (e.g. `necklace.jpg`, `ring.jpg`,
   `heart-pendant.jpg`, …). Prefer **WebP/AVIF** at 2× (retina) resolution.
2. In `components/ProductImage.tsx`, swap the placeholder `<div>` for a
   `next/image` `<Image src={...} fill />` — the surrounding markup and
   aspect ratios stay identical, so nothing else needs to change.

Recommended aspect ratios:

| Usage            | Ratio  |
| ---------------- | ------ |
| Product card     | 4 : 3  |
| Product gallery  | 3 : 4  |
| Category / gems  | 1 : 1  |
| Banner / hero    | 16 : 10|
