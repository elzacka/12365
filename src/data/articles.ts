import type { ArticleCategory } from '../types'

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: 'kom-i-gang',
    tittel: 'Kom i gang',
    beskrivelse: 'De første stegene i Microsoft 365',
    artikler: [
      {
        id: 'logg-inn-m365',
        tittel: 'Logg inn i Microsoft 365',
        ingress: 'Slik logger du inn med jobbkontoen din og kommer i gang med M365 på nett, PC og mobil.',
        kategori: 'kom-i-gang',
        tags: ['innlogging', 'konto', 'nettleser'],
        steg: [
          {
            tittel: 'Åpne nettleseren og gå til microsoft365.com',
            innhold: 'Bruk Edge, Chrome, Firefox eller Safari. Gå til **microsoft365.com** i adressefeltet.',
          },
          {
            tittel: 'Skriv inn jobbkontoen din',
            innhold: 'Jobbkontoen er vanligvis **fornavn.etternavn@virksomheten.no**. Sjekk med IT-avdelingen hvis du er usikker.',
          },
          {
            tittel: 'Fullfør flerfaktorautentisering (MFA)',
            innhold: 'Du blir bedt om å bekrefte identiteten din via SMS, autentiseringsapp eller telefonsamtale. Følg instruksjonene på skjermen.',
          },
          {
            tittel: 'Du er inne',
            innhold: 'Du ser nå startsiden i M365 med alle appene dine. Herfra kan du åpne Teams, Outlook, OneDrive og alt annet.',
          },
        ],
      },
      {
        id: 'installer-teams',
        tittel: 'Installer Teams på PC og mobil',
        ingress: 'Teams fungerer i nettleseren, men appen gir bedre ytelse og varslinger. Her er hvordan du installerer den.',
        kategori: 'kom-i-gang',
        tags: ['teams', 'installasjon', 'mobil'],
        steg: [
          {
            tittel: 'Last ned Teams for PC',
            innhold: 'Gå til **teams.microsoft.com** og klikk «Last ned appen», eller søk etter «Microsoft Teams» i virksomhetens programvarekatalog.',
          },
          {
            tittel: 'Kjør installasjonsfilen',
            innhold: 'Dobbeltklikk på den nedlastede filen og følg installasjonsveiviseren. Du trenger ikke administrator-rettigheter.',
          },
          {
            tittel: 'Logg inn med jobbkontoen',
            innhold: 'Første gang du åpner Teams blir du bedt om å logge inn. Bruk jobbkontoen din — samme som du bruker til e-post.',
          },
          {
            tittel: 'Installer Teams på mobil',
            innhold: 'Søk etter «Microsoft Teams» i App Store (iPhone) eller Google Play (Android). Last ned og logg inn med jobbkontoen.',
          },
        ],
      },
      {
        id: 'fra-filserver-til-sharepoint',
        tittel: 'Fra filserver til SharePoint',
        ingress: 'Den felles filserveren (H:, P: og andre stasjoner) erstattes av Teams og SharePoint. Her er den viktigste forskjellen.',
        kategori: 'kom-i-gang',
        tags: ['sharepoint', 'filserver', 'lagring', 'teams'],
        steg: [
          {
            tittel: 'Forstå forskjellen',
            innhold: '**Filserveren** er mapper på en server på huset. **SharePoint** er et nettbasert fellesområde som er tilgjengelig overalt — hjemme, på kontoret og på mobil.\n\nNår du lagrer en fil i en Teams-kanal, ligger den faktisk i SharePoint.',
          },
          {
            tittel: 'Finn filene dine i Teams',
            innhold: 'Åpne kanalen i Teams og klikk på **Filer**-fanen øverst. Her ligger alle filer som tilhører kanalen.',
          },
          {
            tittel: 'Last opp en fil',
            innhold: 'Klikk **Last opp** i Filer-fanen, eller dra en fil rett inn i Teams-vinduet. Filen lagres direkte i SharePoint.',
          },
          {
            tittel: 'Del lenke — ikke vedlegg',
            innhold: 'I stedet for å sende filen som vedlegg på e-post: høyreklikk filen i Teams og velg **Kopier lenke**. Lim lenken inn i e-posten. Alle ser alltid siste versjon.',
          },
        ],
      },
    ],
  },
  {
    id: 'teams',
    tittel: 'Teams i hverdagen',
    beskrivelse: 'Chat, kanaler, møter og filer',
    artikler: [
      {
        id: 'chat-vs-kanal',
        tittel: 'Chat eller kanal — når bruker du hva?',
        ingress: 'En av de vanligste spørsmåelzacka: hva er forskjellen mellom en Teams-chat og en kanal? Her er tommelfingerregelen.',
        kategori: 'teams',
        tags: ['chat', 'kanal', 'kommunikasjon'],
        steg: [
          {
            tittel: 'Bruk chat for raske avklaringer',
            innhold: '**Chat** er som SMS. Bruk den for korte, direkte meldinger med én eller noen få personer. Samtalen er privat.\n\n*Eksempel: «Kan du ta telefonen kl. 14?»*',
          },
          {
            tittel: 'Bruk kanal for teamarbeid',
            innhold: '**Kanaler** er åpne for hele teamet. Bruk dem for faglig innhold, prosjektoppdateringer og diskusjoner hele teamet bør ha tilgang til.\n\n*Eksempel: Prosjektkanal for årsrapport, kanal for saksbehandling.*',
          },
          {
            tittel: 'Svar alltid i tråd i kanalen',
            innhold: 'Klikk **Svar** under en kanalbeskjed — ikke skriv en ny beskjed. Det holder samtalen samlet og søkbar.',
          },
          {
            tittel: 'Bruk @-omtale for å varsle noen',
            innhold: 'Skriv **@fornavn** for å varsle én person, **@Teamnavn** for hele teamet. De får varsel selv om de ikke sjekker kanalen aktivt.',
          },
        ],
      },
      {
        id: 'teams-moter',
        tittel: 'Hold et Teams-møte',
        ingress: 'Slik starter du og gjennomfører et møte i Teams — enten du er på kontoret eller hjemme.',
        kategori: 'teams',
        tags: ['møte', 'videomøte', 'skjermdelings'],
        steg: [
          {
            tittel: 'Start et møte fra Outlook',
            innhold: 'Opprett en kalenderinvitasjon i Outlook og klikk **Teams-møte** i verktøylinjen. En møtelenke legges automatisk til invitasjonen.',
          },
          {
            tittel: 'Bli med i møtet',
            innhold: 'Klikk **Bli med** i kalenderoppføringen i Outlook eller Teams. Du velger lyd og kamera før du kobler til.',
          },
          {
            tittel: 'Del skjermen',
            innhold: 'Klikk skjermdelings-ikonet i møteverktøylinjen. Du kan dele hele skjermen, ett vindu eller en PowerPoint-presentasjon.',
          },
          {
            tittel: 'Bruk møtenotat',
            innhold: 'Klikk **Notater** i møteverktøylinjen. Notatene deles med alle deltakere og lagres i Teams-kanalen.',
          },
        ],
      },
    ],
  },
  {
    id: 'lagring',
    tittel: 'Lagring og deling',
    beskrivelse: 'OneDrive, SharePoint og filhåndtering',
    artikler: [
      {
        id: 'onedrive-vs-sharepoint',
        tittel: 'OneDrive eller SharePoint?',
        ingress: 'To lagringsplasser — én tommelfingerregel: OneDrive er ditt, SharePoint er felles.',
        kategori: 'lagring',
        tags: ['onedrive', 'sharepoint', 'lagring', 'deling'],
        steg: [
          {
            tittel: 'Bruk OneDrive til eget arbeid',
            innhold: '**OneDrive** er din personlige lagringsplass. Legg kladder, utkast og filer du ikke er klar til å dele her.\n\nTenk på det som hjemmekontoret ditt.',
          },
          {
            tittel: 'Bruk SharePoint (via Teams) til felles arbeid',
            innhold: '**SharePoint** er fellesarealet. Når du lagrer i en Teams-kanal, bruker du SharePoint. Her jobber alle på samme fil — ingen kopier på avveie.',
          },
          {
            tittel: 'Flytt filer til SharePoint når de skal deles',
            innhold: 'Hvis du har startet et dokument i OneDrive og det nå skal inn i et teamprosjekt: åpne filen, klikk **Flytt til** og velg riktig Teams-kanal.',
          },
          {
            tittel: 'Del alltid lenke — ikke vedlegg',
            innhold: 'Høyreklikk filen i OneDrive eller Teams og velg **Del**. Du kan styre hvem som ser og redigerer. Mottakeren får alltid siste versjon.',
          },
        ],
      },
      {
        id: 'versjonshistorikk',
        tittel: 'Finn tilbake til en tidligere versjon',
        ingress: 'M365 lagrer automatisk alle versjoner av dokumentene dine. Du kan alltid rulle tilbake.',
        kategori: 'lagring',
        tags: ['versjon', 'historikk', 'angre'],
        steg: [
          {
            tittel: 'Åpne filen i Word, Excel eller PowerPoint',
            innhold: 'Filen må ligge i OneDrive eller SharePoint — ikke lokalt på PC-en — for at versjonering skal fungere.',
          },
          {
            tittel: 'Klikk på filnavnet øverst',
            innhold: 'Klikk på dokumentnavnet i tittellinja øverst i Word/Excel/PowerPoint. En meny åpnes.',
          },
          {
            tittel: 'Velg Versjonslogg',
            innhold: 'Klikk **Versjonslogg** i menyen. Du ser alle lagrede versjoner med dato og hvem som redigerte.',
          },
          {
            tittel: 'Gjenopprett ønsket versjon',
            innhold: 'Klikk på en versjon for å åpne den. Klikk deretter **Gjenopprett** for å gjøre den til gjeldende versjon.',
          },
        ],
      },
    ],
  },
  {
    id: 'copilot',
    tittel: 'Copilot i hverdagen',
    beskrivelse: 'KI-hjelp i M365 — hva er inkludert og hva krever lisens',
    artikler: [
      {
        id: 'copilot-chat-gratis',
        tittel: 'Hva kan Copilot Chat uten ekstra lisens?',
        ingress: 'Copilot Chat (tidligere «Bing Chat Enterprise») er inkludert i M365. Her er hva du kan bruke den til.',
        kategori: 'copilot',
        tags: ['copilot', 'ki', 'chat', 'lisens'],
        steg: [
          {
            tittel: 'Åpne Copilot Chat',
            innhold: 'Gå til **copilot.microsoft.com** og logg inn med jobbkontoen. Du kan også åpne den fra Edge eller Teams.',
          },
          {
            tittel: 'Still spørsmål og be om utkast',
            innhold: 'Copilot Chat kan hjelpe deg med å skrive tekst, lage sammendrag, svare på spørsmål og brainstorme — basert på det du skriver til den.\n\n**Merk:** Den ser *ikke* e-postene, dokumentene eller kalenderoppføringene dine uten at du limer inn innholdet.',
          },
          {
            tittel: 'Last opp filer i chatten',
            innhold: 'Du kan dra en fil inn i chat-vinduet. Copilot leser innholdet og kan svare på spørsmål om det — nyttig for å oppsummere lange rapporter.',
          },
          {
            tittel: 'Hva er ikke inkludert?',
            innhold: 'Copilot M365 — som ser e-post, kalender, Teams-chat og dokumenter automatisk — **krever eigen lisens**. Snakk med IT eller HR om din virksomhet har eller planlegger å anskaffe denne.',
          },
        ],
      },
    ],
  },
  {
    id: 'outlook',
    tittel: 'Outlook og e-post',
    beskrivelse: 'E-post, kalender og oppgaver',
    artikler: [
      {
        id: 'ryddig-innboks',
        tittel: 'Hold innboksen ryddig',
        ingress: 'Fokusert innboks, regler og kategorier — tre grep som hjelper deg å holde oversikten i Outlook.',
        kategori: 'outlook',
        tags: ['outlook', 'e-post', 'innboks', 'produktivitet'],
        steg: [
          {
            tittel: 'Slå på Fokusert innboks',
            innhold: 'Outlook sorterer automatisk viktige e-poster under **Fokusert** og mindre viktige under **Annet**. Klikk **Vis** i menyen og velg **Fokusert innboks** for å aktivere.',
          },
          {
            tittel: 'Bruk kategorier for å merke e-poster',
            innhold: 'Høyreklikk en e-post og velg **Kategoriser**. Velg eller opprett en fargekategori — praktisk for å skille prosjekter og prioriteter.',
          },
          {
            tittel: 'Flagg e-poster som oppgaver',
            innhold: 'Klikk flagg-ikonet på en e-post. Den dukker opp som en oppgave i **To Do** og i **Min dag**.',
          },
          {
            tittel: 'Bruk Teams til korte avklaringer',
            innhold: 'Tenk over: trenger dette svar i dag, og er det tre linjer eller kortere? Send det som Teams-chat i stedet. Det rydder innboksen til begge parter.',
          },
        ],
      },
    ],
  },
]
