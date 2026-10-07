// One-off: shrink + reformat public assets to their real display sizes.
// Run: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = new URL('../public/assets/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const jobs = [
  // 64px cards → 128px (2x)
  { in: 'tire1.jpg', out: 'tire1.webp', w: 128 },
  { in: 'tire2.jpg', out: 'tire2.webp', w: 128 },
  { in: 'tire3.jpg', out: 'tire3.webp', w: 128 },
  { in: 'battery.jpg', out: 'battery.webp', w: 128 },
  // logo displayed ~145x32 → 290w (2x), keep alpha
  { in: 'logo-dark.png', out: 'logo-dark.webp', w: 290 },
  // product placeholder displayed ≤344x287 → 688w (2x)
  { in: 'product-placeholder.jpeg', out: 'product-placeholder.webp', w: 688 },
  // hero fallback displayed ~620x413 (aspect 3:2) → 1240w (2x)
  { in: 'hero.jpg', out: 'hero.webp', w: 1240 },
];

for (const j of jobs) {
  const src = join(ASSETS, j.in);
  const dst = join(ASSETS, j.out);
  await sharp(src).resize({ width: j.w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(dst);
  console.log(
    `${j.in} ${(statSync(src).size / 1024).toFixed(0)}K → ${j.out} ${(statSync(dst).size / 1024).toFixed(1)}K`,
  );
}

// Splash GIF (508K, 1080x1080 shown at ≤320px) → animated WebP @640px (2x)
const gif = join(ASSETS, 'ezgif-76ee578630df5013.gif');
const webp = join(ASSETS, 'splash.webp');
await sharp(gif, { animated: true })
  .resize({ width: 640, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(webp);
console.log(`gif ${(statSync(gif).size / 1024).toFixed(0)}K → splash.webp ${(statSync(webp).size / 1024).toFixed(1)}K`);
