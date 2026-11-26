// Generates public/og-image.png (1200×630), the preview card shown when a page is shared on
// WhatsApp, Facebook, iMessage, etc. Run after changing the brand, phone or tagline:
//
//   node scripts/make-og-image.mjs
//
// Uses sharp (already installed by Astro). Text is drawn with the system's Helvetica Neue:
// on macOS sharp's text engine uses Apple's font system and can't load the site's Montserrat
// files, so a built-in bold sans is the reliable choice. The PNG is committed, so this only
// needs to run on one machine.
import sharp from 'sharp';

const W = 1200;
const H = 630;
const ROAD = 34; // height of the road strip at the bottom
const GOLD = '#E6B33C';
const CREAM = '#F5EFE3';
const MUTED = '#C9BFAE';

/** Render Pango markup to a transparent PNG. */
const text = (markup, width) => sharp({ text: { text: markup, font: 'Helvetica Neue', rgba: true, width, dpi: 72 } }).png().toBuffer();

// Lion mark on its own off-white rounded square.
const lionSize = 300;
const lion = await sharp('src/assets/images/real/lion-mark.png')
  .resize(lionSize - 40, lionSize - 40, { fit: 'contain', background: '#FAF8F2' })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: '#FAF8F2' })
  .composite([
    {
      input: Buffer.from(`<svg width="${lionSize}" height="${lionSize}"><rect width="100%" height="100%" rx="36" fill="#fff"/></svg>`),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer();

const textLeft = 450;
const textWidth = W - textLeft - 60;
const lines = await Promise.all([
  text(`<span foreground="${GOLD}" weight="bold" letter_spacing="4096" size="21pt">LONDON, ONTARIO &amp; AREA</span>`, textWidth),
  text(`<span foreground="${CREAM}" weight="heavy" size="58pt">Skillmasters\nDriving School</span>`, textWidth),
  text(`<span foreground="${MUTED}" weight="medium" size="23pt">MTO-approved BDE · G2 &amp; G lessons · Pickup included</span>`, textWidth),
  text(`<span foreground="${GOLD}" weight="bold" size="30pt">204-979-5184</span>`, textWidth),
]);

// Stack the text lines and centre the block vertically above the road strip.
const gaps = [20, 20, 34];
const heights = await Promise.all(lines.map(async (b) => (await sharp(b).metadata()).height));
const blockHeight = heights.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0);
let y = Math.round((H - ROAD - blockHeight) / 2);
const textLayers = lines.map((input, i) => {
  const layer = { input, left: textLeft, top: y };
  y += heights[i] + (gaps[i] ?? 0);
  return layer;
});

// Background: ink with a faint gold glow, a road strip and dashed gold lane line at the bottom.
const background = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="0.2" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#2A2210"/>
      <stop offset="1" stop-color="#0B0B0B"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect y="${H - ROAD}" width="${W}" height="${ROAD}" fill="#050505"/>
  <line x1="0" y1="${H - ROAD / 2}" x2="${W}" y2="${H - ROAD / 2}" stroke="#F4D27A" stroke-width="6" stroke-dasharray="60 60"/>
</svg>`);

await sharp(background)
  .composite([{ input: lion, left: 90, top: Math.round((H - ROAD - lionSize) / 2) }, ...textLayers])
  .png({ compressionLevel: 9 })
  .toFile('public/og-image.png');

console.log('Wrote public/og-image.png');
