import { mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_DIR = resolve(root, 'public/icons')

// Header-logoen: ordmerket «1·2·365» i navy og lyseblått, gjennomsiktig bakgrunn.
const LOGO_PNG = resolve(root, 'public/logo-header.png')
const WHITE = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 }

// Andel av kantlengden ordmerket fyller. Vanlige ikoner: 5 % marg; det lave
// ordmerket går klar av iOS sine avrundede hjørner. Maskable (Android, macOS):
// OS garanterer bare en sirkel med diameter 80 %, og diagonalen må få plass.
const ANY_SCALE = 0.9
const MASKABLE_SCALE = 0.75

const logo = await sharp(LOGO_PNG).trim().toBuffer()

async function icon(size, scale, file) {
  const mark = await sharp(logo).resize(Math.round(size * scale)).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: mark, gravity: 'center' }])
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9 })
    .toFile(resolve(ICONS_DIR, file))
}

await mkdir(ICONS_DIR, { recursive: true })
await icon(180, ANY_SCALE, 'apple-touch-icon-180.png')
for (const size of [192, 384, 512]) await icon(size, ANY_SCALE, `icon-${size}.png`)
await icon(512, MASKABLE_SCALE, 'icon-maskable-512.png')

console.log('App-ikoner generert i public/icons/')
