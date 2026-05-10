import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REK_DIR = resolve(root, 'dev_only/SVG/rek')
const KV_DIR = resolve(root, 'dev_only/SVG/kv')
const CANVA_DIR = resolve(root, 'dev_only/Canva')
const PUBLIC_DIR = resolve(root, 'public')
const ICONS_DIR = resolve(PUBLIC_DIR, 'icons')

const HEADER_SVG = resolve(REK_DIR, '12365_logo_rek_transp/12365_logo_rek_transp_RGB_dark.svg')
const FAVICON_SVG = resolve(CANVA_DIR, '6.svg')
const APP_ICON_SVG = resolve(KV_DIR, '12365_logo_kv/12365_logo_RGB_white.svg')
const MASKABLE_SVG = resolve(KV_DIR, '12365_logo_kv/12365_logo_RGB_white.svg')

const NAVY = { r: 0x00, g: 0x26, b: 0x3e, alpha: 1 }
const DENSITY = 300

// Kildevarianter:
// - rek (1500×757,92, aspekt ~1,98:1): horisontalt ordmerke. Brukes kun til
//   header — gir det rektangulære ordmerket plass til å være seg selv.
// - kv (1500×1500, kvadrat): full ordmerke «12|365» hvit på navy. Brukes til
//   apple-touch-icon, PWA-ikoner og maskable — der full merkevare er ønsket.
// - Canva/6.svg (1500×1500, kvadrat): symbolisk 4-rute-grid (M365-launcher-
//   motivet) i hvitt på navy med avrundede hjørner. Brukes kun til
//   nettleser-tab favicon (16/32/48 PNG og favicon.svg) der den lille
//   flaten gjør ordmerket uleselig. Bruker en SVG-mask for rutene — må
//   derfor IKKE kjøres gjennom emphasizeDivider (som ville strippet
//   maske-referansen og ødelagt designet).

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

// Canva/4.svg sin lyseblå divider har stroke-width=19 i et 1500-viewBox,
// som gir under 0,5 px ved 32 px favicon — usynlig. Bumper til 150 så
// streken blir 1-3 px synlig på 16/32/48.
function boostFaviconDivider(svgText) {
  return svgText.replace(/stroke-width="19"/g, 'stroke-width="150"')
}

await mkdir(ICONS_DIR, { recursive: true })

const headerSvg = emphasizeDivider(await readFile(HEADER_SVG, 'utf8'))
await writeFile(resolve(PUBLIC_DIR, 'logo-header.svg'), headerSvg)

// Favicon (nettleser-tab): bruker Canva/6.svg — 4-rute-grid (hvit på navy)
// som fungerer helt ned til 16 px. Render som-er; ingen stroke- eller
// maske-manipulasjon skal anvendes (6.svg har en SVG-mask som lager rutene).
const faviconSvg = await readFile(FAVICON_SVG, 'utf8')
await writeFile(resolve(PUBLIC_DIR, 'favicon.svg'), faviconSvg)

const faviconBuf = Buffer.from(faviconSvg)
for (const size of [32, 48]) {
  await sharp(faviconBuf, { density: DENSITY })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(PUBLIC_DIR, `favicon-${size}.png`))
}

// App-ikoner (apple-touch + PWA): bruker det fulle kv-ordmerket «12|365» —
// hvor flaten er stor nok til at hele merket er gjenkjennelig.
const appIconSvg = emphasizeDivider(await readFile(APP_ICON_SVG, 'utf8'))
const appIconBuf = Buffer.from(appIconSvg)

await sharp(appIconBuf, { density: DENSITY })
  .resize(180, 180, { fit: 'contain' })
  .png({ compressionLevel: 9 })
  .toFile(resolve(ICONS_DIR, 'apple-touch-icon-180.png'))

for (const size of [192, 384, 512]) {
  await sharp(appIconBuf, { density: DENSITY })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(ICONS_DIR, `icon-${size}.png`))
}

// Maskable: Android/Chrome OS lager sin egen maske. Vi rendrer kv-ordmerket
// i full størrelse (512×512) — siden kv-varianten allerede har navy bakgrunn
// kant-til-kant er det ingen ekstra komposisjon nødvendig.
const maskableSvg = emphasizeDivider(await readFile(MASKABLE_SVG, 'utf8'))
await sharp(Buffer.from(maskableSvg), { density: DENSITY })
  .resize(512, 512, { fit: 'contain', background: NAVY })
  .png({ compressionLevel: 9 })
  .toFile(resolve(ICONS_DIR, 'icon-maskable-512.png'))

console.log('Ikoner generert i public/ og public/icons/')
