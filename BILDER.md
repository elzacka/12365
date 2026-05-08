# Bildehandlingsliste — bilder å laste ned manuelt

Denne lista ble laget fordi Microsoft Learn og Tech Community er JavaScript-renderte sider — bilder kan ikke lastes ned automatisk via curl/scripts. Hvert bilde må lastes ned manuelt fra kilden, lagres i riktig mappe, og deretter integreres i `public/content/articles.json` av Claude.

## Slik bruker du lista

1. Åpne kildelenken i nettleseren.
2. Finn skjermbildet som matcher beskrivelsen.
3. Høyreklikk → **Lagre bildet som...**.
4. Lagre i `public/articles/{mappenavn}/{filnavn}` (mapper opprettes ved behov).
5. Kryss av når bildet er lastet ned. Når en bolk er ferdig, gi beskjed så integrerer Claude bildene i `articles.json`.

Foretrekk PNG. Hvis bildet er stort, komprimer til < 200 KB med [TinyPNG](https://tinypng.com).

## Bolk 1 — Kjernesamarbeid

### Teams (7 artikler)

- [ ] **chat-vs-kanal** → `public/articles/teams/01-chat-og-kanal.png`
  - Kilde: <https://support.microsoft.com/nb-no/teams> (eller Microsoft Learn for Teams)
  - Skal vise: Teams-grensesnittet med både chat-listen og en kanal åpen, slik at leseren ser kontrasten.
  - Alternativ: Eget skjermbilde fra ditt Teams-miljø.

- [ ] **teams-eierskap** → `public/articles/teams/01-behandle-team.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/legg-til-eller-fjern-eiere-i-teams> (søk i Microsoft-støtte)
  - Skal vise: «Behandle team»-dialogen med Medlemmer/Eiere-fanen, slik at leseren ser hvordan eiere administreres.

- [ ] **kanaltyper** → `public/articles/teams/01-legg-til-kanal.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/team-og-kanaler-i-microsoft-teams>
  - Skal vise: Dialogen «Legg til kanal» med valgene Standard, Privat, Delt — slik at leseren forstår de tre typene visuelt.

- [ ] **mappestrukturer** → `public/articles/teams/01-filer-i-kanal.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/laste-opp-og-dele-filer-i-microsoft-teams>
  - Skal vise: Filer-fanen i en Teams-kanal med en pen, ryddig mappestruktur (ikke for dyp).

- [ ] **teams-moter** → `public/articles/teams/01-teams-mote.png`
  - Kilde: <https://www.microsoft.com/nb-no/microsoft-teams/group-chat-software>
  - Skal vise: Et aktivt Teams-møte med video, deltakere og kontroller synlig.

- [ ] **teams-tips-og-triks** → `public/articles/teams/01-teams-grensesnitt.png`
  - Kilde: <https://www.microsoft.com/nb-no/microsoft-teams/group-chat-software>
  - Skal vise: Hovedgrensesnittet i Teams med venstremenyen synlig (Chat, Teams, Kalender osv).

- [ ] **team-arkivering** → `public/articles/teams/01-arkivere-team.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/arkivere-eller-gjenopprette-et-team>
  - Skal vise: «Behandle team» → arkiveringsalternativet, eller team-listen med arkiverte team.

### Outlook (1 artikkel)

- [ ] **ryddig-innboks** → `public/articles/outlook/01-fokusert-innboks.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/endre-mellom-fokusert-og-annet-i-outlook-f445ad7f-02f4-4294-a82e-71d8964e3978>
  - Skal vise: Innboksen i Outlook med Fokusert/Annet-fanene øverst.

### OneDrive / SharePoint — felles artikkel (1 artikkel)

- [ ] **onedrive-vs-sharepoint** → `public/articles/pa-tvers/01-onedrive-eller-sharepoint.png`
  - Kilde: <https://support.microsoft.com/nb-no/onedrive>
  - Skal vise: Sammenligning av OneDrive- og SharePoint-grensesnitt, eller OneDrive-mappen i Teams' venstremeny.

### SharePoint (3 artikler — to har allerede bilder)

- [ ] **fra-filserver-til-sharepoint** → `public/articles/sharepoint/01-filer-i-teams.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/laste-opp-og-dele-filer-i-microsoft-teams>
  - Skal vise: Filer-fanen i Teams-kanal som tydelig demonstrerer at SharePoint ligger under.

- [x] **sharepoint-automasjon-2026** — Allerede komplett (7 bilder)
- [ ] **sharepoint-prosessdokumentasjon-visio** → `public/articles/sharepoint-visio/01-visio-i-sharepoint.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/microsoft-visio>
  - Skal vise: Et Visio-diagram som er bygd inn på en SharePoint-side.

## Bolk 2 — Produktivitet og oppgaver

### Planner (1 artikkel)

- [ ] **planner-enkel-oppgavestyring** → `public/articles/planner/01-planner-tavle.png`
  - Kilde: <https://support.microsoft.com/nb-no/planner>
  - Skal vise: Planner-tavlevisning med bøtter og oppgavekort.

### Lists (2 artikler)

- [ ] **lists-hendelseslogg** → `public/articles/lists/01-hendelseslogg-mal.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/microsoft-lists>
  - Skal vise: En liste-mal som ligner en hendelseslogg.

- [ ] **lists-risikoregister** → `public/articles/lists/01-risikoregister-mal.png`
  - Kilde: Som over.
  - Skal vise: En liste-mal eller -visning egnet for risikoregister.

### Loop (1 artikkel)

- [ ] **loop-eller-word** → `public/articles/loop/01-loop-side.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/microsoft-loop>
  - Skal vise: En Loop-side med flere komponenter (tabell, oppgaver osv).

### Shifts (1 artikkel)

- [ ] **komme-i-gang-med-shifts** → `public/articles/shifts/01-vaktplan.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/shifts-i-microsoft-teams>
  - Skal vise: En vaktplanvisning i Shifts.

## Bolk 3 — KI og læring

### Copilot Chat (1 artikkel)

- [ ] **copilot-chat-inkludert** → `public/articles/copilot/01-copilot-chat.png`
  - Kilde: <https://www.microsoft.com/nb-no/microsoft-365/copilot/business-chat>
  - Skal vise: Copilot Chat-grensesnittet med en ledetekst og svar.

### Viva Learning

- [x] **opplaering-sharepoint-viva-learning** — Allerede komplett (4 bilder)

## Bolk 4 — Tverrgående og sikkerhet

- [ ] **vise-redigere-kommentere** → `public/articles/pa-tvers/02-deletilganger.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/dele-onedrive-filer-og-mapper>
  - Skal vise: Delingsdialogen med valgene «Vise», «Redigere», «Kommentere».

- [ ] **versjonshistorikk** → `public/articles/pa-tvers/03-versjonshistorikk.png`
  - Kilde: <https://support.microsoft.com/nb-no/office/aktivere-og-konfigurere-versjonskontroll>
  - Skal vise: Versjonshistorikk-panelet på en fil i SharePoint/OneDrive.

- [ ] **rydd-for-m365** → `public/articles/kom-i-gang/01-rydd.png`
  - Kilde: Eget bilde, eller en illustrasjon fra Microsofts kom-i-gang-side.
  - Skal vise: Filer/mapper i prosess for å ryddes.

- [ ] **folsomhetsetiketter** → `public/articles/sikkerhet/01-folsomhetsetikett.png`
  - Kilde: <https://learn.microsoft.com/nb-no/purview/sensitivity-labels>
  - Skal vise: Følsomhetsetikett-menyen i et Word/Excel-dokument.

## Etter nedlasting

Når bilder er på plass, gi beskjed til Claude med:

> «Bilder for [bolknavn] er lastet ned — integrer dem i articles.json.»

Claude vil da:
1. Verifisere at filene ligger på riktig sti.
2. Legge til `bilde`-objekter på riktig steg i `articles.json` med `src`, `alt`, `bildetekst` og `kreditering`.
3. Bygge og verifisere prosjektet.
4. Foreslå commit-melding.
