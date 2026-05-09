import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SVG_DIR = resolve(root, 'dev_only/SVG/rek')
const PUBLIC_DIR = resolve(root, 'public')
const ICONS_DIR = resolve(PUBLIC_DIR, 'icons')

const HEADER_SVG = resolve(SVG_DIR, '12365_logo_rek_transp/12365_logo_rek_transp_RGB_dark.svg')
const FAVICON_SVG = resolve(SVG_DIR, '12365_logo_rek/12365_logo_rek_RGB_white.svg')
const MASKABLE_SVG = resolve(SVG_DIR, '12365_logo_rek_transp/12365_logo_rek_transp_RGB_white.svg')

const NAVY = { r: 0x00, g: 0x26, b: 0x3e, alpha: 1 }
const NAVY_HEX = '#00263e'
const DENSITY = 300

// Kildens rek-SVG-er er rektangulære (1500×757,92, aspekt ~1,98:1) med
// glyfer og skillestrek i fullfunksjonell layout. Vi bruker dem slik:
// - Header: kopier som-er. Aspekt og strek bevart, vektor-skarp i alle DPR.
// - Favicon/app-ikon: pakk inn i en kvadratisk viewBox (1500×1500) med
//   navy bakgrunn over hele det utvidede arealet. Glyfer sentrert
//   vertikalt med navy bånd over og under.
// - Maskable: rektangulær transparent variant skalert til 410-bred safe
//   zone på 512×512 navy lerret.

// Skillestreken er stroke-width="12" på 1500-bred viewBox og er gruppert
// inne i en mask som gir 80 % opacity. Ved små render-størrelser (header
// 80×40 px, favicon 32×32 px) blir streken sub-piksel og forsvinner i
// antialiasing. Vi tykker den til 30 og fjerner masken — fortsatt elegant
// ved store størrelser, men robust ved små.
function emphasizeDivider(svgText) {
  return svgText
    .replace(/stroke-width="12"/g, 'stroke-width="30"')
    .replace(/\smask="url\(#[^)]+\)"/g, '')
}

await mkdir(ICONS_DIR, { recursive: true })

const headerSvg = emphasizeDivider(await readFile(HEADER_SVG, 'utf8'))
await writeFile(resolve(PUBLIC_DIR, 'logo-header.svg'), headerSvg)

function makeSquareFaviconSvg(svgText) {
  const NEW_VIEWBOX = '0 -371.04 1500 1500'
  // Utvid SVG-en til kvadrat ved å (a) endre viewBox, (b) strekke clipPath
  // som rammer inn bakgrunns-pathen, og (c) erstatte selve bakgrunns-pathen
  // (både hvit og navy versjon, identisk d-attributt) til å dekke hele den
  // nye flaten. Slik unngår vi sømartifakter ved skjøtekanten.
  const NEW_AREA_PATH = 'M 0 -371.04 L 1500 -371.04 L 1500 1129 L 0 1129 Z M 0 -371.04 '
  const ORIGINAL_BG_D =
    'M 0.078125 0 L 1499.921875 0 L 1499.921875 749.921875 L 0.078125 749.921875 Z M 0.078125 0 '
  const ORIGINAL_CLIP_D =
    'M 0.078125 0 L 1499.917969 0 L 1499.917969 749.921875 L 0.078125 749.921875 Z M 0.078125 0 '
  return svgText
    .replace(/\swidth="[^"]*"/, ' width="2000"')
    .replace(/\sheight="[^"]*"/, ' height="2000"')
    .replace(/\sviewBox="[^"]*"/, ` viewBox="${NEW_VIEWBOX}"`)
    .replaceAll(ORIGINAL_BG_D, NEW_AREA_PATH)
    .replaceAll(ORIGINAL_CLIP_D, NEW_AREA_PATH)
}

const faviconSvgText = emphasizeDivider(await readFile(FAVICON_SVG, 'utf8'))
const faviconSquareSvg = makeSquareFaviconSvg(faviconSvgText)
await writeFile(resolve(PUBLIC_DIR, 'favicon.svg'), faviconSquareSvg)

const faviconBuf = Buffer.from(faviconSquareSvg)
for (const size of [32, 48]) {
  await sharp(faviconBuf, { density: DENSITY })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(PUBLIC_DIR, `favicon-${size}.png`))
}

await sharp(faviconBuf, { density: DENSITY })
  .resize(180, 180, { fit: 'contain' })
  .png({ compressionLevel: 9 })
  .toFile(resolve(ICONS_DIR, 'apple-touch-icon-180.png'))

for (const size of [192, 384, 512]) {
  await sharp(faviconBuf, { density: DENSITY })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(ICONS_DIR, `icon-${size}.png`))
}

const maskableSvg = emphasizeDivider(await readFile(MASKABLE_SVG, 'utf8'))
const inner = await sharp(Buffer.from(maskableSvg), { density: DENSITY })
  .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

await sharp({
  create: { width: 512, height: 512, channels: 4, background: NAVY },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(resolve(ICONS_DIR, 'icon-maskable-512.png'))

console.log('Ikoner generert i public/ og public/icons/')
