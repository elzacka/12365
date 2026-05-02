# 12365 — Prosjektkontekst for AI

PWA på React 19 + TypeScript + Vite + Tailwind 4, hostet på GitHub Pages under `/12365/`.

For prosjektoversikt, oppstart og mappestruktur — se [README.md](README.md).

## Designprinsipper

Følg disse i alle endringer:

- **Mobile-first** — design for 375 px-skjerm, skaler opp
- **Klarspråk** — aktiv form, korte setninger, direkte til brukeren (norsk bokmål)
- **Tilgjengelighet** — WCAG 2.2 AA (lovpålagt offentlig sektor)
- **Offline-først** — PWA med Workbox-caching, ikke avheng av nettverk
- **Ingen eksterne ikonbiblioteker** — selvhostede SVG-ikoner i `Icons.tsx`

## Innholdsoppdateringer

**Ny M365-app:** legg til i `M365_CARDS`-arrayen i [src/data/cards.ts](src/data/cards.ts).

**Ny veiledning:** legg til i riktig kategori i `ARTICLE_CATEGORIES` i [src/data/articles.ts](src/data/articles.ts), eller opprett ny kategori.

**Innholdsformat for artikler:**

```typescript
{
  id: 'unik-id',                    // kebab-case
  tittel: 'Kort og presis',         // klarspråk
  ingress: 'En setning som beskriver hva veiledningen dekker.',
  kategori: 'kategori-id',
  tags: ['søkeord'],
  steg: [
    {
      tittel: 'Stegnavn',
      innhold: 'Bruk **fet tekst** for nøkkelord.',
      bilde: {                      // valgfritt
        src: 'articles/<mappe>/<filnavn>.png',
        alt: 'Beskrivelse for skjermlesere',
        bildetekst: 'Hva bildet viser',
        kreditering: 'Kilde: ...',
      },
    },
  ],
}
```

## Versjonsbumping

Følg SemVer-policyen i [README.md](README.md). Oppdater `version` i [package.json](package.json) ved endringer som rettferdiggjør det.
