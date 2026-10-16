import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = resolve(root, 'public')
const ICONS_DIR = resolve(PUBLIC_DIR, 'icons')

// Header-logoen: ordmerket «1·2·365» i navy og lyseblått, gjennomsiktig bakgrunn.
const LOGO_PNG = resolve(root, 'public/logo-header.png')
const WHITE = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 }

// Andel av kantlengden ordmerket fyller. iOS: 5 % marg; det lave ordmerket går
// klar av de avrundede hjørnene. Maskable (Android, macOS): OS garanterer bare
// en sirkel med diameter 80 %, og diagonalen må få plass.
const APPLE_SCALE = 0.9
const MASKABLE_SCALE = 0.75

const logo = await sharp(LOGO_PNG).trim().toBuffer()

// «any»-ikonene (Windows, ChromeOS): hele ordmerket blir uleselig i 24–36 px på
// oppgavelinja, så de viser «1·2» i hvitt på en brand-700-sirkel uten bakgrunn.
const ONE_TWO_COLUMNS = { left: 15, width: 245 } // «1·2» i logo-header.png
const CIRCLE_DIAMETER = 0.94
const ONE_TWO_HEIGHT = 0.46

const oneTwoCrop = await sharp(LOGO_PNG).extract({ ...ONE_TWO_COLUMNS, top: 0, height: 260 }).png().toBuffer()
const oneTwoGlyphs = await sharp(oneTwoCrop).trim().png().toBuffer()
const { width: oneTwoW, height: oneTwoH } = await sharp(oneTwoGlyphs).metadata()
const oneTwoWhite = await sharp({ create: { width: oneTwoW, height: oneTwoH, channels: 4, background: WHITE } })
  .composite([{ input: oneTwoGlyphs, blend: 'dest-in' }])
  .png()
  .toBuffer()

async function circleIcon(size, file) {
  const circle = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${(size * CIRCLE_DIAMETER) / 2}" fill="#00263e"/></svg>`
  const mark = await sharp(oneTwoWhite).resize({ height: Math.round(size * ONE_TWO_HEIGHT) }).toBuffer()
  await sharp(Buffer.from(circle))
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(ICONS_DIR, file))
}

async function icon(size, scale, file) {
  const mark = await sharp(logo).resize(Math.round(size * scale)).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: mark, gravity: 'center' }])
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9 })
    .toFile(resolve(ICONS_DIR, file))
}

await mkdir(ICONS_DIR, { recursive: true })
await icon(180, APPLE_SCALE, 'apple-touch-icon-180.png')
for (const size of [192, 384, 512]) await circleIcon(size, `icon-${size}.png`)
await icon(512, MASKABLE_SCALE, 'icon-maskable-512.png')

// Favicon: Tabler «apps» (som på Appene-kortet) i brand-400, gjennomsiktig bakgrunn
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 18 18" fill="none" stroke="#41758f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>
  <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>
  <path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>
  <path d="M14 7l6 0"/>
  <path d="M17 4l0 6"/>
</svg>
`
await writeFile(resolve(PUBLIC_DIR, 'favicon.svg'), FAVICON_SVG)
for (const size of [32, 48]) {
  await sharp(Buffer.from(FAVICON_SVG), { density: 600 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(resolve(PUBLIC_DIR, `favicon-${size}.png`))
}

console.log('App-ikoner og favicon generert i public/')
