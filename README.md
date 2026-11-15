# 1-2-365

Til deg som har forvilla deg hit: Hei!

Jeg har laget appen **1-2-365** for å sette turbo på:

- min egen **læring og modning** i Microsoft 365-universet
- min evne til å **lære andre**
- **utfasing av dokumentfiler** så langt som mulig – fordi digitalisering (og ikke minst KI) blir mindre dyr, tidkrevende og vanskelig i en datadrevet organisasjon

**Du finner den her:** https://elzacka.github.io/12365/

Trykk på et bilde for å se det i full størrelse.

<a href="docs/screenshots/oversikt-1.webp"><img alt="Fire skjermbilder fra 1-2-365: Startsiden, Appene, Se og hør og Gjør sånn" src="docs/screenshots/oversikt-1.webp"></a>

<a href="docs/screenshots/oversikt-2.webp"><img alt="Fire skjermbilder fra 1-2-365: En veiledning i Lists, Jukselapp, Hurtigtaster og Alt i E5" src="docs/screenshots/oversikt-2.webp"></a>

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, React Router, vite-plugin-pwa med Workbox, MiniSearch (søk) og Media Chrome (videospiller). Installerbar PWA på desktop og mobil.

## Komme i gang

```bash
npm install
npm run dev      # Lokal utvikling
npm run build    # Produksjonsbygg
npm run lint     # ESLint
npm test         # Tester (Vitest)
npm run lock     # Krypter skjult innhold (admin)
```

Push til `main` bygger og publiserer automatisk via GitHub Pages.

## Innhold

Redigerbart innhold ligger i `public/content/` (JSON). `OM-APPEN.md` og `PERSONVERN.md` i rotmappen rendres til appen via en innebygd markdown-renderer.

## Versjonering

[SemVer](https://semver.org/) – PATCH for innholdsoppdateringer og bugfiks, MINOR for nye apper, nye veiledninger og ny funksjonalitet, MAJOR for bruddendringer i datastruktur eller navigasjon.

## Lisens

MIT – se [LICENSE](LICENSE).
