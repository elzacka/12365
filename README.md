# 12365 — M365 på 1-2-3

Til deg som har forvilla deg hit: Hei!

Jeg har laget appen **12365** for å sette turbo på:

- min egen **læring og modning** i Microsoft 365-universet
- min evne til å **lære andre**
- **utfasing av dokumentfiler** så langt som mulig — fordi digitalisering (og ikke minst KI) blir mindre dyrt, tidkrevende og vanskelig i en datadrevet virksomhet

**Du finner den her:** https://elzacka.github.io/12365/

<img width="1855" height="945" alt="12365" src="https://github.com/user-attachments/assets/210a9b6e-1256-43d0-8eb6-91aea30e664a" />

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, React Router, vite-plugin-pwa. Installerbar PWA på desktop og mobil.

## Komme i gang

```bash
npm install
npm run dev      # Lokal utvikling
npm run build    # Produksjonsbygg
npm run lint     # ESLint
```

Push til `main` bygger og publiserer automatisk via GitHub Pages.

## Innhold

Redigerbart innhold ligger i `public/content/` (JSON). `OM-APPEN.md` og `PERSONVERN.md` i rotmappen rendres til appen via en innebygd markdown-renderer.

## Versjonering

[SemVer](https://semver.org/lang/no/) — PATCH for innholdsoppdateringer og bugfiks, MINOR for ny funksjonalitet, MAJOR for bruddendringer.

## Lisens

MIT — se [LICENSE](LICENSE).
