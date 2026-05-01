# 365 KI — Ikkesant, nå snakker vi

*Versjon: 0.1.0*
*Sist oppdatert: 2026-05-01*
*Til deg som eventuelt har ramla inn her: Hei!*

## Om appen

Stikkord: Microsoft 365, økosystem, datadrevet, automatisering, KI.

PWA for å sette turbo på:
a) min egen læring og modning i digitalisering.
b) min evne til å lære andre.
c) avviklingen av de fæle, fæle dokumentfilene - ugress som gjør at "digitalisering og KI på ekte" tar lenger tid enn nødvendig 


**To seksjoner nå i starten:**
- **Om appene** — flip-card-oversikt over alle M365-apper
- **Slik gjør du** — steg-for-steg-veiledninger kategorisert etter bruksområder

## Tech stack

| Verktøy | Versjon | Bruk |
|---|---|---|
| React | 19 | UI-rammeverk |
| TypeScript | 6 | Streng typing |
| Vite | 7 | Byggverktøy (8 blokkert av `vite-plugin-pwa@1.2.0` peer-deps) |
| Tailwind CSS | 4 | Styling, mobile-first (CSS-first via `@theme`) |
| React Router | 7 | Klientside-routing (`react-router-dom`) |
| vite-plugin-pwa | 1 | Service Worker, manifest |

## Versjonering

MAJOR.MINOR.PATCH (SemVer)
- PATCH: Innholdsoppdateringer, bugfiks
- MINOR: Nye apper, nye veiledninger, ny funksjonalitet
- MAJOR: Bruddendringer i datastruktur eller navigasjon

## Mappestruktur

```
src/
  types/        — TypeScript-grensesnitt
  data/
    cards.ts    — M365 flip-card-data (alle apper)
    articles.ts — Veiledningsartikler og kategorier
  components/
    Icons.tsx   — Selvhostede SVG-ikoner (offline-støtte)
    Header.tsx  — App-header med navigasjon
    FlipCard.tsx — Flip-card-komponent
  pages/
    Home.tsx       — Forsiden med to valg
    OmAppene.tsx   — Flip-card-oversikt med søk
    SlikGjorDu.tsx — Artikkeloversikt med søk
    Artikkel.tsx   — Steg-for-steg artikkelvisning
```

## Innholdsoppdateringer

**Legge til ny M365-app:** `src/data/cards.ts` — legg til i `M365_CARDS`-arrayen.

**Legge til ny veiledning:** `src/data/articles.ts` — legg til i riktig kategori i `ARTICLE_CATEGORIES`, eller opprett ny kategori.

**Nytt innholdsformat:**
```typescript
{
  id: 'unik-id',            // kebab-case
  tittel: 'Kort og presis', // klarspråk
  ingress: 'En setning...',
  kategori: 'kategori-id',
  tags: ['søkeord'],
  steg: [
    { tittel: 'Stegnavn', innhold: 'Bruk **fet tekst** for nøkkelord.' }
  ],
}
```

## Viktige designprinsipper

- **Mobile-first** — alt designes for 375px-skjerm, skaleres opp
- **Klarspråk** — aktiv form, korte setninger, direkte til brukeren
- **Tilgjengelighet** — WCAG 2.2 AA (lovpålagt offentlig sektor)
- **Offline-støtte** — PWA med Workbox-caching
- **Ingen eksterne ikonbiblioteker** — SVG-ikoner i Icons.tsx

## Kommandoer

```bash
npm run dev      # Kjør lokalt (http://localhost:5173)
npm run build    # Produksjonsbygg
npm run preview  # Forhåndsvis produksjonsbygg
```
