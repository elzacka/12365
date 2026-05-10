import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(root, 'public/m365-icons')
const RAW = 'https://raw.githubusercontent.com/loryanstrant/MicrosoftCloudLogos/main'
const TARGET = 1024

const sources = [
  { slug: 'teams',            path: 'logos/teams/teams-1024x1024-(2025-unofficial).png',                 mode: 'png-asis' },
  { slug: 'word',             path: 'logos/word/word-1024x1024-(2025-unofficial).png',                   mode: 'png-asis' },
  { slug: 'excel',            path: 'logos/excel/excel-1024x1024-(2025-unofficial).png',                 mode: 'png-asis' },
  { slug: 'powerpoint',       path: 'logos/powerpoint/powerpoint-1024x1024-(2025-unofficial).png',       mode: 'png-asis' },
  { slug: 'outlook',          path: 'logos/outlook/outlook-1024x1024-(2025-unofficial).png',             mode: 'png-asis' },
  { slug: 'onenote',          path: 'logos/onenote/onenote-1024x1024-(2025-unofficial).png',             mode: 'png-asis' },
  { slug: 'onedrive',         path: 'logos/onedrive/onedrive-1024x1024-(2025-unofficial).png',           mode: 'png-asis' },
  { slug: 'sharepoint',       path: 'logos/sharepoint/sharepoint-1024x1024-(2025-unofficial).png',       mode: 'png-asis' },
  { slug: 'loop',             path: 'logos/loop/microsoft-loop-logo.png',                                mode: 'png-fit' },
  { slug: 'copilot-chat',     path: 'logos/copilot/microsoft-365-copilot.svg',                           mode: 'svg' },
  { slug: 'copilot-m365',     path: 'logos/copilot/microsoft-365-copilot.svg',                           mode: 'svg' },
  { slug: 'copilot-studio',   path: 'logos/copilot-studio/copilotstudio-scalable.svg',                   mode: 'svg' },
  { slug: 'forms',            path: 'logos/forms/forms-512.png',                                        mode: 'png-asis' },
  { slug: 'clipchamp',        path: 'logos/clipchamp/clipchamp-512.png',                                 mode: 'png-asis' },
  { slug: 'visio',            url:  'https://upload.wikimedia.org/wikipedia/commons/6/64/Microsoft_Office_Visio_%282019%29.svg', mode: 'svg' },
  { slug: 'bookings',         path: 'logos/bookings/new-bookings-2048x1839.png',                         mode: 'png-fit' },
  { slug: 'edge',             path: 'logos/edge/microsoft-edge.png',                                     mode: 'png-fit' },
  { slug: 'lists',            path: 'logos/lists/2020-current-full-color/microsoft-lists-265x265.png',   mode: 'png-asis' },
  { slug: 'planner',          url:  'https://upload.wikimedia.org/wikipedia/commons/d/d4/Microsoft_Planner_%282024%E2%80%93present%29.svg', mode: 'svg' },
  { slug: 'power-apps',       path: 'logos/power-apps/powerapps-scalable.svg',                           mode: 'svg' },
  { slug: 'power-automate',   path: 'logos/power-automate/powerautomate-scalable.svg',                   mode: 'svg' },
  { slug: 'power-bi',         path: 'logos/power-bi/powerbi-scalable.svg',                               mode: 'svg' },
  { slug: 'shifts',           url:  'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Fluent_UI_%E2%80%93_ic_fluent_shifts_32_color.svg', mode: 'svg' },
  { slug: 'sway',             url:  'https://upload.wikimedia.org/wikipedia/commons/b/b7/Microsoft_Office_Sway_%282019%E2%80%93present%29.svg', mode: 'svg' },
  { slug: 'to-do',            path: 'logos/to-do/to-do.svg',                                             mode: 'svg' },
  { slug: 'whiteboard',       path: 'logos/whiteboard/whiteboard-transparent.png',                       mode: 'png-trim-fit' },
  { slug: 'viva-connections', path: 'logos/viva-connections/viva-connections.svg',                       mode: 'svg' },
  { slug: 'viva-engage',      path: 'logos/viva-engage/viva-engage.svg',                                 mode: 'svg' },
  { slug: 'viva-insights',    path: 'logos/viva-insights/viva-insights.svg',                             mode: 'svg' },
  { slug: 'viva-learning',    path: 'logos/viva-learning/viva-learning.svg',                             mode: 'svg' },
]

await mkdir(OUT_DIR, { recursive: true })

let okCount = 0
let failCount = 0

const UA = '12365-icon-fetcher/1.0 (https://github.com/elzacka/12365)'

for (const src of sources) {
  const url = src.url ?? `${RAW}/${src.path.split('/').map(encodeURIComponent).join('/')}`
  const out = resolve(OUT_DIR, `${src.slug}.png`)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())

    if (src.mode === 'png-asis') {
      await writeFile(out, buf)
    } else if (src.mode === 'svg') {
      await sharp(buf, { density: 300 })
        .resize(TARGET, TARGET, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(out)
    } else if (src.mode === 'png-fit') {
      await sharp(buf)
        .resize(TARGET, TARGET, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(out)
    } else if (src.mode === 'png-trim-fit') {
      await sharp(buf)
        .trim()
        .resize(TARGET, TARGET, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(out)
    }
    console.log(`OK   ${src.slug.padEnd(20)}  ${src.url ?? src.path}`)
    okCount++
  } catch (e) {
    console.error(`FAIL ${src.slug.padEnd(20)}  ${url}`)
    console.error(`     ${e.message}`)
    failCount++
  }
}

console.log(`\nFerdig: ${okCount} ok, ${failCount} feil`)
