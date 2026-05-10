# 12365 — M365 på 1-2-3

Til deg som har forvilla deg hit: Hei!

Jeg har laget appen **12365** for å sette turbo på:

- min egen **læring og modning** i Microsoft 365-universet
- min evne til å **lære andre**
- **utfasing av dokumentfiler** så langt som mulig — fordi digitalisering (og ikke minst KI) blir mindre dyrt, tidkrevende og vanskelig i en datadrevet organisasjon

**Du finner den her:** https://elzacka.github.io/12365/

<img width="1920" height="1080" alt="12365" src="https://github.com/user-attachments/assets/2b6e7367-9958-4f71-b324-fa3b0ce9286d" />

## Om 12365

Stikkord: Microsoft 365, økosystem, datadrevet, automatisering, KI.

### Bygd som en PWA

En "PWA" (Progressive Web App) er en nettside som bruker moderne webteknologi for å gi en app-lignende opplevelse direkte i nettleseren. De er raske, kan installeres på startskjermen utenom appbutikker, fungerer offline og kan sende push-varsler. PWA-er kombinerer det beste fra nettsider og native mobilapper. Bruk som app både på desktop og mobil.

### Tre hovedseksjoner

- **Om M365-appene** — flip-card-oversikt over 29 M365-apper, med Microsofts oktober-2025 Fluid-ikoner
- **Slik gjør du** — steg-for-steg-veiledninger fordelt på 11 kategorier (Kom i gang, På tvers, Copilot, Lists, Outlook, Planner, SharePoint, Teams, Shifts, Viva Learning, Sikkerhet)
- **Totaloversikt - M365** — komplett oversikt over alle apper, tjenester og funksjoner i E3 og E5-planen (189 innslag i 27 kategorier under 3 tema), basert på Microsofts Modern Work Plan Comparison Enterprise (mai 2026)

### Innholdsoppdateringer

Alt redigerbart innhold ligger i `public/content/`-mappen:

- [`public/content/cards.json`](public/content/cards.json) — flip-cards for M365-apper
- [`public/content/articles.json`](public/content/articles.json) — veiledninger og kategorier
- [`public/content/videos.json`](public/content/videos.json) — videoer
- [`public/content/license-comparison.json`](public/content/license-comparison.json) — E3/E5-lisensdata

[`OM-APPEN.md`](OM-APPEN.md) og [`PERSONVERN.md`](PERSONVERN.md) ligger i repoets rotmappe og rendres til appen via en innebygd markdown-renderer som støtter overskrifter (#, ##, ###, ####), avsnitt med myke linjeskift, **fet** og *kursiv* tekst, lenker `[tekst](url)` (interne `/sti` rutes via React Router; `https://...` åpnes i ny fane), samt punkt- og nummererte lister.

Push til `main` bygger og publiserer automatisk via GitHub Pages.

### Tech stack

| Verktøy | Versjon | Bruk |
|---|---|---|
| React | 19 | UI-rammeverk |
| TypeScript | 6 | Streng typing |
| Vite | 7 | Byggverktøy |
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
    loader.ts        — Henter content/-JSON-filer ved behov
    video-source.ts  — Tolker video-kilder (lokal/YouTube/Vimeo)
  lib/
    markdown.tsx     — Innebygd markdown-renderer for OM-APPEN og PERSONVERN
  components/
    Icons.tsx         — Selvhostede SVG-ikoner (offline-støtte)
    Header.tsx        — App-header med navigasjon
    FlipCard.tsx      — Flip-card-komponent
    InstallBanner.tsx — PWA-installasjonsbanner
    UpdateToast.tsx   — Service worker oppdaterings-toast
  pages/
    Home.tsx       — Forsiden med tre valg
    OmAppene.tsx   — Flip-card-oversikt med søk
    SlikGjorDu.tsx — Artikkeloversikt med søk
    Artikkel.tsx   — Steg-for-steg artikkelvisning
    Videoer.tsx    — Videooversikt
    Video.tsx      — Videoavspilling
    Lisenser.tsx   — Totaloversikt - M365 (apper, tjenester og funksjoner per lisens)
    OmAppen.tsx    — Om appen (renderer OM-APPEN.md)
    Personvern.tsx — Personvernerklæring (renderer PERSONVERN.md)
public/
  articles/    — Bilder brukt i veiledninger
  m365-icons/  — App-ikoner for flip-cards (PNG, opptil 1024x1024, hentet via scripts/fetch-icons.mjs fra mscloudlogos.com)
  icons/       — PWA-app-ikoner
  videos/      — Videoer og miniatyrbilder
  content/     — JSON-innhold (cards, articles, videos, license-comparison)
```

## Versjonering

[MAJOR.MINOR.PATCH (SemVer)](https://semver.org/lang/no/):

- **PATCH** — innholdsoppdateringer, bugfiks
- **MINOR** — nye apper, nye veiledninger, ny funksjonalitet
- **MAJOR** — bruddendringer i datastruktur eller navigasjon

## Lisens

MIT — se [LICENSE](LICENSE).
