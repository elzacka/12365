import { mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = resolve(root, 'public')
const ICONS_DIR = resolve(PUBLIC_DIR, 'icons')

// Ordmerket «1·2·365» i navy og lyseblått, gjennomsiktig bakgrunn.
const LOGO_PNG = resolve(root, 'dev_only/logo/v2 (2).png')
const WHITE = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 }

// Andel av kantlengden ordmerket fyller. Vanlige ikoner: 8 % marg, nok for
// iOS sine avrundede hjørner. Maskable: OS garanterer bare en sirkel med
// diameter 80 %, og ordmerkets diagonal må få plass i den.
const ANY_SCALE = 0.84
const MASKABLE_SCALE = 0.6

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

// Header: vises som h-10 (40 px); 6x for skarp gjengivelse på retina.
await sharp(logo)
  .resize({ height: 240 })
  .png({ compressionLevel: 9 })
  .toFile(resolve(PUBLIC_DIR, 'logo-header.png'))

console.log('App-ikoner og header-logo generert i public/')
