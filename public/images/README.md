# Product imagery

This folder holds the storefront's product photography — real jewellery
photos referenced by the `image` fields in `data/jewelleryData.ts` and
rendered through `next/image` (`components/ProductImage.tsx`).

Current files (necklace, earrings, ring, bracelet, pendant, collection-\*,
hero, gemstones, editorial …) are the live catalogue images.

## Replacing / adding photos

- Overwrite a file in place (keep the same name) to swap a product's photo, or
- Point a product's `image` field in `data/jewelleryData.ts` at a new file,
  then re-seed the database so the change reaches the store:

  ```bash
  SEED_FORCE=1 npm run db:seed
  ```

Recommended: square-ish or portrait crops, subject centred (cards use
`object-cover`), WebP/JPG at ~1000px. `next/image` emits AVIF/WebP
automatically.
