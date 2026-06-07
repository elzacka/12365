// Hashes every public content item and writes public/content/versions.json.
// The client reads this file at startup and compares against localStorage to
// decide where to show an "ny eller endret"-prikk. Items with
// "skjul-endret": true are excluded — useful for typo fixes that should not
// surface as new content to the user.

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readJson(rel) {
  return JSON.parse(readFileSync(resolve(ROOT, rel), 'utf-8'))
}

// Stable JSON stringify with sorted keys. Excludes the suppress flag so it
// doesn't itself bump the hash.
function stableStringify(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']'
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).filter(k => k !== 'skjul-endret').sort()
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}'
  }
  return JSON.stringify(value)
}

function hash(value) {
  return createHash('sha256').update(stableStringify(value)).digest('hex').slice(0, 10)
}

const cards = readJson('public/content/cards.json')
const articles = readJson('public/content/articles.json')
const videos = readJson('public/content/videos.json')
const courses = readJson('public/content/courses.json')
const license = readJson('public/content/e5-license-overview.json')
const about = readFileSync(resolve(ROOT, 'OM-APPEN.md'), 'utf-8')

const versions = {
  generated: new Date().toISOString().slice(0, 10),
  cards: {},
  articles: {},
  videos: {},
  courses: {},
  license: hash(license),
  about: createHash('sha256').update(about).digest('hex').slice(0, 10),
  // Items with a manual "endret"-date are not seeded into localStorage on a
  // first visit. They keep showing a prikk until the user interacts with them.
  endret: { cards: {}, articles: {}, videos: {}, courses: {} },
}

if (license.endret) versions.endret.license = license.endret

for (const card of cards) {
  if (card['skjul-endret']) continue
  versions.cards[card.navn] = hash(card)
  if (card.endret) versions.endret.cards[card.navn] = card.endret
}

for (const category of articles) {
  for (const article of category.artikler ?? []) {
    if (article['skjul-endret']) continue
    if (article.skjult) continue
    versions.articles[article.id] = hash(article)
    if (article.endret) versions.endret.articles[article.id] = article.endret
  }
}

for (const video of videos) {
  if (video['skjul-endret']) continue
  versions.videos[video.id] = hash(video)
  if (video.endret) versions.endret.videos[video.id] = video.endret
}

for (const course of courses) {
  if (course['skjul-endret']) continue
  versions.courses[course.id] = hash(course)
  if (course.endret) versions.endret.courses[course.id] = course.endret
}

writeFileSync(
  resolve(ROOT, 'public/content/versions.json'),
  JSON.stringify(versions, null, 2) + '\n',
)

console.log(
  `versions.json: ${Object.keys(versions.cards).length} cards, ` +
  `${Object.keys(versions.articles).length} articles, ` +
  `${Object.keys(versions.videos).length} videos, ` +
  `${Object.keys(versions.courses).length} courses, license, about`,
)
