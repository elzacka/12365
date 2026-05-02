# 12365 — Microsoft 365 på 1-2-3

*Til deg som eventuelt har ramla inn her: Hei!*

En app (PWA) for å sette turbo på:

- min egen **læring og modning** i digitalisering
- min evne til å **lære andre**
- **utfasing av dokumentfiler** så langt som mulig — fordi digitalisering (og ikke minst KI) blir mindre dyrt, tidkrevende og vanskelig i en datadrevet virksomhet

**Live:** https://elzacka.github.io/12365/

*En PWA (Progressive Web App) er en nettside som bruker moderne webteknologi for å gi en app-lignende opplevelse direkte i nettleseren. De er raske, kan installeres på startskjermen utenom appbutikker, fungerer offline og kan sende push-varsler. PWA-er kombinerer det beste fra nettsider og native mobilapper.*

## Om appen

Stikkord: Microsoft 365, økosystem, datadrevet, automatisering, KI.

To hovedseksjoner:

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
| vite-plugin-pwa | 1 | Service Worker og manifest |

## Komme i gang

```bash
npm install
npm run dev      # Lokal utvikling (http://localhost:5173/12365/)
npm run build    # Produksjonsbygg
npm run preview  # Forhåndsvis produksjonsbygg
npm run lint     # Kjør ESLint
```

## Mappestruktur

```
src/
  types/        — TypeScript-grensesnitt
  data/
    cards.ts    — M365 flip-card-data
    articles.ts — Veiledningsartikler og kategorier
  components/
    Icons.tsx         — Selvhostede SVG-ikoner (offline-støtte)
    Header.tsx        — App-header med navigasjon
    FlipCard.tsx      — Flip-card-komponent
    InstallBanner.tsx — PWA-installasjonsbar
  pages/
    Home.tsx       — Forsiden med to valg
    OmAppene.tsx   — Flip-card-oversikt med søk
    SlikGjorDu.tsx — Artikkeloversikt med søk
    Artikkel.tsx   — Steg-for-steg artikkelvisning
public/
  articles/    — Bilder brukt i veiledninger
  m365-icons/  — App-ikoner for flip-cards
  icons/       — PWA-app-ikoner
```

## Versjonering

[MAJOR.MINOR.PATCH (SemVer)](https://semver.org/lang/no/):

- **PATCH** — innholdsoppdateringer, bugfiks
- **MINOR** — nye apper, nye veiledninger, ny funksjonalitet
- **MAJOR** — bruddendringer i datastruktur eller navigasjon

## Lisens

MIT — se [LICENSE](LICENSE).
