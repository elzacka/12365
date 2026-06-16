#!/usr/bin/env python3
"""
Merge entries from Ordliste.md into ordbok.json.
Also patches a few aliases on existing entries.
"""
import json, copy

with open('public/content/ordbok.json', encoding='utf-8') as f:
    data = json.load(f)

# ── Patch existing entries ────────────────────────────────────────────────────

def patch_alias(entry_id, new_aliases):
    for e in data:
        if e['id'] == entry_id:
            existing = e.get('alias', [])
            for a in new_aliases:
                if a not in existing:
                    existing.append(a)
            e['alias'] = existing
            return
    raise ValueError(f'Entry not found: {entry_id}')

patch_alias('deepfake',    ['Dypforfalskning'])
patch_alias('flop',        ['Flyttallsoperasjon'])
patch_alias('kit-triaden', ['KIT', 'CIA'])

# ── New entries ───────────────────────────────────────────────────────────────

NEW = [
  {
    "id": "akseptkriterier",
    "tittel": "Akseptkriterier",
    "forklaring": "Kriterier som resultatene av risikoanalysen sammenholdes med for å avgjøre om sikkerhetsmålene er nådd. Fastsettes typisk av øverste ledelse og hentes fra risikorammeverket.",
    "tags": ["risiko"],
    "alias": ["Akseptansekriterier", "Evalueringskriterier"]
  },
  {
    "id": "alarp",
    "tittel": "ALARP",
    "forklaring": "Prinsipp om at risiko reduseres så lavt som det er praktisk gjennomførbart, inntil ytterligere reduksjon ville være uforholdsmessig kostbar sett mot gevinsten.",
    "tags": ["risiko"],
    "alias": ["As Low As Reasonably Practicable", "Forholdsmessighet"]
  },
  {
    "id": "alvorlig-hendelse-ki",
    "tittel": "Alvorlig hendelse",
    "undertittel": "KI-forordningen",
    "forklaring": "Hendelse eller funksjonssvikt i et KI-system som direkte eller indirekte fører til dødsfall, alvorlig helseskade, alvorlig forstyrrelse av kritisk infrastruktur, overtredelse av grunnleggende rettigheter eller alvorlig skade på eiendom eller miljø.",
    "tags": ["ki"]
  },
  {
    "id": "analyseobjekt",
    "tittel": "Analyseobjekt",
    "forklaring": "Fysisk eller organisatorisk system, enhet, fenomen eller aktivitet som risikovurderingen er rettet mot.",
    "tags": ["risiko"]
  },
  {
    "id": "balansert-styrke",
    "tittel": "Balansert styrke",
    "undertittel": "tiltaksprinsipp",
    "forklaring": "Sikkerhetstiltakene skal gi tilnærmet lik beskyttelse for alle verdier med samme sikkerhetsbehov.",
    "tags": ["risiko"]
  },
  {
    "id": "barriere",
    "tittel": "Barriere",
    "forklaring": "Tiltak med til hensikt å påvirke et hendelsesforløp slik at hendelsen ikke inntreffer eller ikke får uønskede konsekvenser.",
    "tags": ["risiko"]
  },
  {
    "id": "bemyndiget-representant-ki",
    "tittel": "Bemyndiget representant",
    "undertittel": "KI-forordningen",
    "forklaring": "Fysisk eller juridisk person i Unionen med skriftlig fullmakt fra leverandøren til å oppfylle forordningsforpliktelsene på leverandørens vegne.",
    "tags": ["ki"]
  },
  {
    "id": "biometriske-opplysninger",
    "tittel": "Biometriske opplysninger",
    "forklaring": "Personopplysninger fra særskilt teknisk behandling av en persons fysiologiske, biologiske eller atferdsmessige egenskaper – for eksempel ansiktsbilder eller fingeravtrykk – som muliggjør entydig identifikasjon.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "biometrisk-identifikasjon",
    "tittel": "Biometrisk identifikasjon",
    "forklaring": "Automatisk gjenkjenning av fysiske, fysiologiske, atferdsmessige eller psykologiske egenskaper for å fastslå en persons identitet ved å sammenligne biometriske opplysninger med en referansedatabase.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "biometrisk-kategoriseringssystem-ki",
    "tittel": "Biometrisk kategoriseringssystem",
    "undertittel": "KI-forordningen",
    "forklaring": "KI-system som plasserer fysiske personer i bestemte kategorier på grunnlag av biometriske opplysninger.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "biometrisk-verifisering",
    "tittel": "Biometrisk verifisering",
    "forklaring": "Automatisert en-til-en-verifisering av en persons identitet ved å sammenligne nylig innhentede biometriske opplysninger med tidligere avgitte data.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "biometrisk-fjernidentifikasjon-ettertid-ki",
    "tittel": "Biometrisk fjernidentifikasjon i ettertid",
    "undertittel": "KI-forordningen",
    "forklaring": "System for biometrisk fjernidentifikasjon som ikke opererer i sanntid – identifikasjonen skjer i etterkant av datafangsten.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "biometrisk-fjernidentifikasjon-sanntid-ki",
    "tittel": "Biometrisk fjernidentifikasjon i sanntid",
    "undertittel": "KI-forordningen",
    "forklaring": "System for biometrisk fjernidentifikasjon der innhenting, sammenligning og identifikasjon skjer uten vesentlig forsinkelse.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "bringe-i-omsetning-ki",
    "tittel": "Bringe i omsetning",
    "undertittel": "KI-forordningen",
    "forklaring": "Gjøre et KI-system eller en KI-modell for allmenne formål tilgjengelig på unionsmarkedet for første gang.",
    "tags": ["ki"]
  },
  {
    "id": "bruksanvisning-ki",
    "tittel": "Bruksanvisning",
    "undertittel": "KI-forordningen",
    "forklaring": "Informasjon fra leverandøren som opplyser idriftsetteren om tiltenkt formål og riktig bruk av et KI-system.",
    "tags": ["ki"]
  },
  {
    "id": "ce-merking",
    "tittel": "CE-merking",
    "forklaring": "Leverandørens erklæring om at et KI-system oppfyller kravene i KI-forordningens kapittel III og annet gjeldende EU-harmoniseringsregelverk.",
    "tags": ["ki"]
  },
  {
    "id": "distributør-ki",
    "tittel": "Distributør",
    "undertittel": "KI-forordningen",
    "forklaring": "Enhver fysisk eller juridisk person i forsyningskjeden som gjør et KI-system tilgjengelig på markedet, uten å være leverandør eller importør.",
    "tags": ["ki"]
  },
  {
    "id": "fare",
    "tittel": "Fare",
    "forklaring": "Forhold som kan føre til en uønsket hendelse av utilsiktet karakter – i motsetning til en trussel, som er tilsiktet.",
    "tags": ["risiko"]
  },
  {
    "id": "felles-spesifikasjon-ki",
    "tittel": "Felles spesifikasjon",
    "undertittel": "KI-forordningen",
    "forklaring": "Sett av tekniske spesifikasjoner fastsatt av EU som gir mulighet for å oppfylle bestemte krav i KI-forordningen.",
    "tags": ["ki"]
  },
  {
    "id": "fenomen",
    "tittel": "Fenomen",
    "undertittel": "risikovurdering",
    "forklaring": "Uønsket hendelse av utilsiktet karakter, for eksempel naturkatastrofe eller pandemi – i motsetning til en trusselaktørs tilsiktede handling.",
    "tags": ["risiko"]
  },
  {
    "id": "flerfaktorautentisering",
    "tittel": "Flerfaktorautentisering",
    "forklaring": "Autentisering med minst to uavhengige faktorer fra ulike kategorier – noe du vet (passord/PIN), noe du har (kodebrikke/telefon) og noe du er (biometri). Gir vesentlig bedre beskyttelse enn passord alene.",
    "tags": ["sikkerhet"],
    "alias": ["MFA", "Multi-Factor Authentication"]
  },
  {
    "id": "forsøksperson-ki",
    "tittel": "Forsøksperson",
    "undertittel": "KI-forordningen",
    "forklaring": "Fysisk person som deltar i testing av et KI-system under virkelige forhold.",
    "tags": ["ki"]
  },
  {
    "id": "følelsesgjenkjenningssystem-ki",
    "tittel": "Følelsesgjenkjenningssystem",
    "undertittel": "KI-forordningen",
    "forklaring": "KI-system som identifiserer eller utleder en persons følelser eller intensjoner på grunnlag av biometriske opplysninger.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "gjøre-tilgjengelig-på-markedet-ki",
    "tittel": "Gjøre tilgjengelig på markedet",
    "undertittel": "KI-forordningen",
    "forklaring": "Levere et KI-system eller en KI-modell for allmenne formål for distribusjon eller bruk på unionsmarkedet – mot betaling eller vederlagsfritt.",
    "tags": ["ki"]
  },
  {
    "id": "idriftsetter-ki",
    "tittel": "Idriftsetter",
    "undertittel": "KI-forordningen",
    "forklaring": "Fysisk eller juridisk person, offentlig myndighet eller organ som bruker et KI-system under sin myndighet – unntatt ved personlig, ikke-yrkesmessig bruk.",
    "tags": ["ki"]
  },
  {
    "id": "importør-ki",
    "tittel": "Importør",
    "undertittel": "KI-forordningen",
    "forklaring": "Fysisk eller juridisk person i Unionen som bringer i omsetning et KI-system som bærer navn eller varemerke fra en aktør etablert utenfor EU/EØS.",
    "tags": ["ki"]
  },
  {
    "id": "informert-samtykke-ki",
    "tittel": "Informert samtykke",
    "undertittel": "KI-forordningen",
    "forklaring": "En forsøkspersons fritt avgitte, spesifikke og frivillige vilje til å delta i testing av et KI-system under virkelige forhold, etter å ha mottatt all relevant informasjon om testingen.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "inndata-ki",
    "tittel": "Inndata",
    "undertittel": "KI-forordningen",
    "forklaring": "Data som leveres til eller innhentes direkte av et KI-system, og som systemet produserer utdata på grunnlag av.",
    "tags": ["ki"],
    "alias": ["Input"]
  },
  {
    "id": "innsatsfaktor",
    "tittel": "Innsatsfaktor",
    "forklaring": "Ressurs som trengs for å ivareta ett eller flere nivåer i verdihierarkiet – for eksempel energi, kommunikasjon, transport, materiell eller kompetanse.",
    "tags": ["risiko"]
  },
  {
    "id": "kapabiliteter-med-høy-påvirkningsgrad-ki",
    "tittel": "Kapabiliteter med høy påvirkningsgrad",
    "undertittel": "KI-forordningen",
    "forklaring": "Evner i en KI-modell som svarer til eller overgår kapabilitetene i de mest avanserte KI-modellene for allmenne formål.",
    "tags": ["ki"]
  },
  {
    "id": "ki-kompetanse",
    "tittel": "KI-kompetanse",
    "undertittel": "KI-forordningen",
    "forklaring": "Ferdigheter, kunnskap og forståelse som gjør leverandører, idriftsettere og brukere i stand til å treffe informerte beslutninger om KI-systemer og forstå mulighetene, risikoene og skadene de kan medføre.",
    "tags": ["ki"]
  },
  {
    "id": "ki-kontoret",
    "tittel": "KI-kontoret",
    "undertittel": "KI-forordningen",
    "forklaring": "EU-kommisjonens funksjon med ansvar for gjennomføring, overvåking og tilsyn med KI-systemer og KI-modeller for allmenne formål, etablert ved kommisjonsbeslutning av 24. januar 2024.",
    "tags": ["ki"]
  },
  {
    "id": "ki-modell-for-allmenne-formål",
    "tittel": "KI-modell for allmenne formål",
    "undertittel": "KI-forordningen",
    "forklaring": "KI-modell trent på store datamengder som viser bred allmenngyldighet og kan utføre et vidt spekter av oppgaver, og som kan integreres i nedstrøms systemer og applikasjoner.",
    "tags": ["ki"],
    "alias": ["GPAI model", "General-Purpose AI model"]
  },
  {
    "id": "ki-system-ki",
    "tittel": "KI-system",
    "undertittel": "KI-forordningen",
    "forklaring": "Maskinbasert system som opererer med varierende grad av autonomi, kan tilpasses etter idriftsetting, og som – basert på inndata – utleder prediksjoner, innhold, anbefalinger eller beslutninger som kan påvirke fysiske eller virtuelle miljøer.",
    "tags": ["ki"]
  },
  {
    "id": "ki-system-for-allmenne-formål",
    "tittel": "KI-system for allmenne formål",
    "undertittel": "KI-forordningen",
    "forklaring": "KI-system basert på en KI-modell for allmenne formål, som kan tjene en rekke ulike formål – ved direkte bruk eller integrering i andre KI-systemer.",
    "tags": ["ki"],
    "alias": ["General-Purpose AI system", "GPAI system"]
  },
  {
    "id": "ki-systemets-ytelse",
    "tittel": "KI-systemets ytelse",
    "undertittel": "KI-forordningen",
    "forklaring": "Et KI-systems evne til å oppnå sitt tiltenkte formål.",
    "tags": ["ki"]
  },
  {
    "id": "informasjonsklassifisering",
    "tittel": "Klassifisering",
    "undertittel": "informasjonssikkerhet",
    "forklaring": "Inndeling av informasjon i beskyttelsesnivåer – for eksempel Åpen, Intern, Konfidensiell – basert på konsekvensen av brudd på konfidensialitet, integritet eller tilgjengelighet.",
    "tags": ["sikkerhet"]
  },
  {
    "id": "konsekvens",
    "tittel": "Konsekvens",
    "undertittel": "risikovurdering",
    "forklaring": "Tap av verdier som følge av en uønsket hendelse.",
    "tags": ["risiko"]
  },
  {
    "id": "kritisk-funksjon",
    "tittel": "Kritisk funksjon",
    "forklaring": "Leveranse eller tjeneste som er nødvendig for å ivareta de overordnede verdiene i en organisasjon.",
    "tags": ["risiko"]
  },
  {
    "id": "kritisk-infrastruktur",
    "tittel": "Kritisk infrastruktur",
    "forklaring": "Infrastruktur som er avgjørende for samfunnets grunnleggende funksjoner og som det er spesielt viktig å beskytte.",
    "tags": ["risiko", "sikkerhet"],
    "alias": ["Critical infrastructure"]
  },
  {
    "id": "kunnskapsgrunnlag",
    "tittel": "Kunnskapsgrunnlag",
    "forklaring": "Kilder, data og kompetanse som ligger til grunn for en risikovurdering – inkludert kjente svakheter og usikkerheter i grunnlaget.",
    "tags": ["risiko"]
  },
  {
    "id": "leverandør-ki",
    "tittel": "Leverandør",
    "undertittel": "KI-forordningen",
    "forklaring": "Fysisk eller juridisk person, offentlig myndighet eller organ som utvikler et KI-system eller en KI-modell for allmenne formål, og bringer det i omsetning under eget navn eller varemerke.",
    "tags": ["ki"]
  },
  {
    "id": "markedstilsynsmyndighet-ki",
    "tittel": "Markedstilsynsmyndighet",
    "undertittel": "KI-forordningen",
    "forklaring": "Nasjonal myndighet som utfører markedstilsyn for KI-systemer i henhold til KI-forordningen.",
    "tags": ["ki"]
  },
  {
    "id": "meldermyndighet-ki",
    "tittel": "Meldermyndighet",
    "undertittel": "KI-forordningen",
    "forklaring": "Nasjonal myndighet med ansvar for å vurdere, utpeke og melde samsvarsvurderingsorganer og føre tilsyn med dem.",
    "tags": ["ki"]
  },
  {
    "id": "meldt-organ-ki",
    "tittel": "Meldt organ",
    "undertittel": "KI-forordningen",
    "forklaring": "Samsvarsvurderingsorgan som er offisielt meldt og godkjent i henhold til KI-forordningen og relevant EU-harmoniseringsregelverk.",
    "tags": ["ki"]
  },
  {
    "id": "minimalisme-sikkerhet",
    "tittel": "Minimalisme",
    "undertittel": "tiltaksprinsipp",
    "forklaring": "Sikkerhetstiltak skal ikke ha annen funksjonalitet eller større kompleksitet enn det som er nødvendig.",
    "tags": ["risiko"]
  },
  {
    "id": "minste-privilegium",
    "tittel": "Minste privilegium",
    "undertittel": "tiltaksprinsipp",
    "forklaring": "Brukere og systemer skal ikke gis mer tilgang enn det som er strengt nødvendig for å utføre oppgaven.",
    "tags": ["risiko", "sikkerhet"],
    "alias": ["Least privilege", "Least privilege principle"]
  },
  {
    "id": "motstandsdyktighet",
    "tittel": "Motstandsdyktighet",
    "undertittel": "tiltaksprinsipp",
    "forklaring": "Prinsipp om tilstrekkelig uavhengighet mellom sikkerhetstiltak, slik at én enkelt feil eller hendelse ikke svekker eller setter ut av funksjon flere tiltak samtidig.",
    "tags": ["risiko"],
    "alias": ["Resilience"]
  },
  {
    "id": "nasjonal-vedkommende-myndighet-ki",
    "tittel": "Nasjonal vedkommende myndighet",
    "undertittel": "KI-forordningen",
    "forklaring": "Betegnelse som dekker både meldermyndigheten og markedstilsynsmyndigheten for KI-systemer i en medlemsstat.",
    "tags": ["ki"]
  },
  {
    "id": "nedstrømsleverandør-ki",
    "tittel": "Nedstrømsleverandør",
    "undertittel": "KI-forordningen",
    "forklaring": "Leverandør av et KI-system – herunder et KI-system for allmenne formål – som integrerer en KI-modell fra en annen leverandør.",
    "tags": ["ki"]
  },
  {
    "id": "offentlig-tilgjengelig-sted",
    "tittel": "Offentlig tilgjengelig sted",
    "undertittel": "KI-forordningen",
    "forklaring": "Ethvert offentlig eller privateid fysisk sted som er tilgjengelig for et ubestemt antall personer, uavhengig av eventuelle vilkår for tilgang.",
    "tags": ["ki"]
  },
  {
    "id": "operatør-ki",
    "tittel": "Operatør",
    "undertittel": "KI-forordningen",
    "forklaring": "Samlebetegnelse for leverandør, produkttilvirker, idriftsetter, bemyndiget representant, importør og distributør under KI-forordningen.",
    "tags": ["ki"]
  },
  {
    "id": "personopplysninger-om-straffbare-forhold",
    "tittel": "Personopplysninger om straffbare forhold",
    "forklaring": "Opplysninger om straffedommer og lovovertredelser – ikke en særlig kategori, men underlagt egne begrensninger etter GDPR artikkel 10.",
    "tags": ["personvern"]
  },
  {
    "id": "personopplysninger-ki",
    "tittel": "Personopplysninger",
    "undertittel": "KI-forordningen",
    "forklaring": "Personopplysninger som definert i GDPR artikkel 4 nr. 1 – enhver opplysning om en identifisert eller identifiserbar fysisk person.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "plan-for-testing-under-virkelige-forhold-ki",
    "tittel": "Plan for testing under virkelige forhold",
    "undertittel": "KI-forordningen",
    "forklaring": "Dokument som beskriver mål, metode, omfang og organisering av testing av et KI-system under virkelige forhold.",
    "tags": ["ki"]
  },
  {
    "id": "regulatorisk-sandkasse-for-ki",
    "tittel": "Regulatorisk sandkasse for KI",
    "undertittel": "KI-forordningen",
    "forklaring": "Kontrollert ramme opprettet av vedkommende myndighet der leverandører kan utvikle, trene og teste innovative KI-systemer under myndighetstilsyn i en begrenset periode.",
    "tags": ["ki"]
  },
  {
    "id": "restrisiko",
    "tittel": "Restrisiko",
    "forklaring": "Risiko som gjenstår etter at sikkerhetstiltak er etablert.",
    "tags": ["risiko"]
  },
  {
    "id": "rettshåndhevelse",
    "tittel": "Rettshåndhevelse",
    "undertittel": "KI-forordningen",
    "forklaring": "Aktiviteter utført av rettshåndhevende myndigheter for å forebygge, etterforske, avsløre eller straffeforfølge straffbare forhold, herunder vern mot trusler mot offentlig sikkerhet.",
    "tags": ["ki"]
  },
  {
    "id": "rettshåndhevende-myndighet",
    "tittel": "Rettshåndhevende myndighet",
    "undertittel": "KI-forordningen",
    "forklaring": "Offentlig myndighet eller organ med nasjonal hjemmel til å forebygge, etterforske, avsløre eller straffeforfølge straffbare forhold og verne mot trusler mot offentlig sikkerhet.",
    "tags": ["ki"]
  },
  {
    "id": "rimelig-forutsigbar-feilbruk-ki",
    "tittel": "Rimelig forutsigbar feilbruk",
    "undertittel": "KI-forordningen",
    "forklaring": "Bruk av et KI-system som ikke er i tråd med tiltenkt formål, men som rimelig kan forventes å skje basert på menneskelig atferd eller samhandling med andre systemer.",
    "tags": ["ki"]
  },
  {
    "id": "risikoakseptanse",
    "tittel": "Risikoakseptanse",
    "forklaring": "Aktivt valg om å akseptere en sikkerhetsrisiko som ikke kan eller skal reduseres ytterligere. Forutsetter at risikoen er forstått, innebærer et ansvar dersom risikoen realiseres, og skal dokumenteres og etterprøves.",
    "tags": ["risiko"],
    "alias": ["Risikoaksept"]
  },
  {
    "id": "risikoanalyse",
    "tittel": "Risikoanalyse",
    "forklaring": "Systematisk framgangsmåte for å beskrive og beregne risiko knyttet til en eller flere uønskede hendelser.",
    "tags": ["risiko"]
  },
  {
    "id": "risikoeier",
    "tittel": "Risikoeier",
    "forklaring": "Rollen som eier verdien og har myndighet til å håndtere den aktuelle risikoen.",
    "tags": ["risiko"]
  },
  {
    "id": "risikoevaluering",
    "tittel": "Risikoevaluering",
    "forklaring": "Prosess for å vurdere om sikkerhetsmålene er nådd ved å sammenholde risikoanalysens resultater med evalueringskriteriene.",
    "tags": ["risiko"]
  },
  {
    "id": "risikohåndtering",
    "tittel": "Risikohåndtering",
    "forklaring": "Håndtering av identifiserte risikoer gjennom ett av fire valg: redusere, akseptere, fjerne (unngå det som representerer risikoen) eller overføre risiko til andre.",
    "tags": ["risiko"]
  },
  {
    "id": "risikokommunikasjon",
    "tittel": "Risikokommunikasjon",
    "forklaring": "At alle med tjenstlig behov gjøres kjent med aktuelle risikoer, sårbarheter og tiltak – høy risiko som krever umiddelbare tiltak kommuniseres uten opphold.",
    "tags": ["risiko"]
  },
  {
    "id": "risikooppfølging",
    "tittel": "Risikooppfølging",
    "forklaring": "Løpende oppfølging av risikovurderinger og tiltak for å sikre at besluttede tiltak iverksettes og fungerer etter hensikten – risikoeier har ansvaret.",
    "tags": ["risiko"]
  },
  {
    "id": "risikovurdering",
    "tittel": "Risikovurdering",
    "forklaring": "Samlet prosess bestående av å etablere rammer, identifisere uønskede hendelser, gjennomføre risikoanalyse og risikoevaluering.",
    "tags": ["risiko"]
  },
  {
    "id": "samsvarsvurdering-ki",
    "tittel": "Samsvarsvurdering",
    "undertittel": "KI-forordningen",
    "forklaring": "Prosess for å påvise at kravene til et høyrisiko-KI-system er oppfylt i henhold til KI-forordningens kapittel III.",
    "tags": ["ki"]
  },
  {
    "id": "samsvarsvurderingsorgan",
    "tittel": "Samsvarsvurderingsorgan",
    "undertittel": "KI-forordningen",
    "forklaring": "Tredjepartsorgan som utfører samsvarsvurderingsaktiviteter for KI-systemer, herunder testing, sertifisering og inspeksjon.",
    "tags": ["ki"]
  },
  {
    "id": "sandkasseplan-ki",
    "tittel": "Sandkasseplan",
    "undertittel": "KI-forordningen",
    "forklaring": "Dokument avtalt mellom leverandør og myndighet som beskriver mål, vilkår, tidsramme og metode for aktiviteter i den regulatoriske sandkassen.",
    "tags": ["ki"]
  },
  {
    "id": "sannsynlighet",
    "tittel": "Sannsynlighet",
    "undertittel": "risikovurdering",
    "forklaring": "Angivelse av hvor trolig det er at en uønsket hendelse vil inntreffe.",
    "tags": ["risiko"]
  },
  {
    "id": "sensitive-operasjonelle-data-ki",
    "tittel": "Sensitive operasjonelle data",
    "undertittel": "KI-forordningen",
    "forklaring": "Operasjonelle data om etterforskning eller straffeforfølging som kan sette en straffesaks integritet i fare dersom de avsløres.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "sikkerhetskomponent-ki",
    "tittel": "Sikkerhetskomponent",
    "undertittel": "KI-forordningen",
    "forklaring": "Komponent i et produkt eller KI-system som oppfyller en sikkerhetsfunksjon, eller som ved svikt medfører fare for menneskers helse eller eiendom.",
    "tags": ["ki", "sikkerhet"]
  },
  {
    "id": "sikkerhetsmål",
    "tittel": "Sikkerhetsmål",
    "forklaring": "Fastsatte mål for ivaretakelse av verdier i en organisasjon – operasjonaliseres i målbare aksept- og evalueringskriterier.",
    "tags": ["risiko"]
  },
  {
    "id": "sikkerhetsrisiko",
    "tittel": "Sikkerhetsrisiko",
    "forklaring": "Usikkerhet knyttet til om en uønsket hendelse vil inntreffe og hvilke konsekvenser den kan få. I KI-forordningen: kombinasjonen av sannsynligheten for at skade oppstår og skadens alvorlighetsgrad.",
    "tags": ["risiko", "ki"],
    "alias": ["Risiko"]
  },
  {
    "id": "sikkerhetstiltak",
    "tittel": "Sikkerhetstiltak",
    "forklaring": "Organisatorisk, menneskelig, fysisk eller teknisk tiltak for å håndtere risiko – skal ikke være mer inngripende enn nødvendig.",
    "tags": ["risiko", "sikkerhet"]
  },
  {
    "id": "sikring-i-dybden",
    "tittel": "Sikring i dybden",
    "undertittel": "tiltaksprinsipp",
    "forklaring": "Svikt i ett enkelt tiltak alene skal ikke kunne medføre tap eller kompromittering – systemet beskyttes gjennom lag på lag av tiltak.",
    "tags": ["risiko", "sikkerhet"],
    "alias": ["Defence in depth", "Defense in depth"]
  },
  {
    "id": "sterk-autentisering",
    "tittel": "Sterk autentisering",
    "forklaring": "Autentisering som krever minst to faktorer og gir vesentlig bedre beskyttelse enn passord alene. Datatilsynet stiller krav til sterk autentisering ved tilgang til systemer med sensitive personopplysninger over eksterne nett.",
    "tags": ["sikkerhet", "personvern"]
  },
  {
    "id": "system-for-biometrisk-fjernidentifikasjon-ki",
    "tittel": "System for biometrisk fjernidentifikasjon",
    "undertittel": "KI-forordningen",
    "forklaring": "KI-system som identifiserer fysiske personer uten aktiv medvirkning, vanligvis på avstand, ved å sammenligne biometriske opplysninger med en referansedatabase.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "system-for-overvåking-etter-omsetning-ki",
    "tittel": "System for overvåking etter omsetning",
    "undertittel": "KI-forordningen",
    "forklaring": "Leverandørens aktiviteter for å innhente og gjennomgå erfaringer med bruk av KI-systemer de har brakt i omsetning, for å avdekke behov for korrigerende tiltak.",
    "tags": ["ki"]
  },
  {
    "id": "systemrisiko-ki",
    "tittel": "Systemrisiko",
    "undertittel": "KI-forordningen",
    "forklaring": "Risiko spesifikk for kapabiliteter med høy påvirkningsgrad i KI-modeller for allmenne formål, med potensielt store negative virkninger på folkehelse, sikkerhet, grunnleggende rettigheter eller samfunnet.",
    "tags": ["ki"]
  },
  {
    "id": "særlige-kategorier-av-personopplysninger",
    "tittel": "Særlige kategorier av personopplysninger",
    "forklaring": "Personopplysninger med særlig behov for vern: rasemessig eller etnisk opprinnelse, politisk oppfatning, religion, fagforeningsmedlemskap, genetiske og biometriske opplysninger, helseopplysninger og opplysninger om seksuelle forhold. Behandling er i utgangspunktet forbudt. Tidligere kalt sensitive personopplysninger.",
    "tags": ["personvern"],
    "alias": ["Sensitive personopplysninger", "Special categories of personal data"]
  },
  {
    "id": "særlige-kategorier-av-personopplysninger-ki",
    "tittel": "Særlige kategorier av personopplysninger",
    "undertittel": "KI-forordningen",
    "forklaring": "Personopplysningskategoriene omhandlet i GDPR artikkel 9, direktiv 2016/680 artikkel 10 og forordning 2018/1725 artikkel 10.",
    "tags": ["ki", "personvern"]
  },
  {
    "id": "sårbarhet",
    "tittel": "Sårbarhet",
    "forklaring": "Analyseobjektets manglende evne til å motstå uønskede hendelser eller varige påkjenninger, eller til å opprettholde og gjenopprette sin funksjon etterpå.",
    "tags": ["risiko", "sikkerhet"],
    "alias": ["Vulnerability"]
  },
  {
    "id": "sårbarhetsvurdering",
    "tittel": "Sårbarhetsvurdering",
    "forklaring": "Vurdering av en verdis manglende evne til å motstå en uønsket hendelse eller gjenopprette en stabil tilstand etter uønsket påvirkning.",
    "tags": ["risiko"]
  },
  {
    "id": "ta-i-bruk-ki",
    "tittel": "Ta i bruk",
    "undertittel": "KI-forordningen",
    "forklaring": "Levere et KI-system til første gangs bruk direkte til idriftsetteren eller til bruk i Unionen for dets tiltenkte formål.",
    "tags": ["ki"]
  },
  {
    "id": "testdata-ki",
    "tittel": "Testdata",
    "undertittel": "KI-forordningen",
    "forklaring": "Data brukt til å gi en uavhengig evaluering av et KI-system og bekrefte systemets forventede ytelse før det bringes i omsetning.",
    "tags": ["ki"]
  },
  {
    "id": "testing-under-virkelige-forhold-ki",
    "tittel": "Testing under virkelige forhold",
    "undertittel": "KI-forordningen",
    "forklaring": "Midlertidig testing av et KI-system for tiltenkt formål under reelle forhold utenfor laboratorium eller simulert miljø, for å innhente pålitelige data og bekrefte samsvar med forordningen.",
    "tags": ["ki"]
  },
  {
    "id": "tilbakekalling-ki",
    "tittel": "Tilbakekalling av KI-system",
    "undertittel": "KI-forordningen",
    "forklaring": "Tiltak med formål om at et KI-system som er gjort tilgjengelig for idriftsettere, returneres til leverandøren, tas ut av drift eller deaktiveres.",
    "tags": ["ki"]
  },
  {
    "id": "tilbaketrekking-ki",
    "tittel": "Tilbaketrekking av KI-system",
    "undertittel": "KI-forordningen",
    "forklaring": "Tiltak med formål om å hindre at et KI-system i forsyningskjeden gjøres tilgjengelig på markedet.",
    "tags": ["ki"]
  },
  {
    "id": "tiltenkt-formål-ki",
    "tittel": "Tiltenkt formål",
    "undertittel": "KI-forordningen",
    "forklaring": "Den bruken et KI-system er beregnet på fra leverandørens side, inkludert spesifikk sammenheng og vilkår, slik det fremgår av bruksanvisning og teknisk dokumentasjon.",
    "tags": ["ki"]
  },
  {
    "id": "trussel",
    "tittel": "Trussel",
    "forklaring": "Tilsiktet handling som kan føre til en uønsket hendelse – i motsetning til et fenomen, som er utilsiktet.",
    "tags": ["risiko", "sikkerhet"]
  },
  {
    "id": "trusselaktør",
    "tittel": "Trusselaktør",
    "forklaring": "Menneskelig aktør med intensjon om å gjennomføre en tilsiktet handling som kan føre til en uønsket hendelse.",
    "tags": ["risiko"]
  },
  {
    "id": "trusselvurdering",
    "tittel": "Trusselvurdering",
    "forklaring": "Løpende vurdering av aktuelle trusler som kan utløse hendelser med negative konsekvenser for organisasjonens verdier.",
    "tags": ["risiko"]
  },
  {
    "id": "usikkerhet",
    "tittel": "Usikkerhet",
    "undertittel": "risikovurdering",
    "forklaring": "Manglende kunnskap om om en uønsket hendelse vil inntreffe og hvilke konsekvenser den kan få – ved høy usikkerhet skal dette synliggjøres og vektlegges ved fastsettelse av risikonivå.",
    "tags": ["risiko"]
  },
  {
    "id": "utbredt-overtredelse-ki",
    "tittel": "Utbredt overtredelse",
    "undertittel": "KI-forordningen",
    "forklaring": "Handling eller unnlatelse i strid med EUs regler for vern av enkeltpersoners interesser, som skader eller kan forventes å skade kollektive interesser i flere medlemsstater.",
    "tags": ["ki"]
  },
  {
    "id": "uønsket-hendelse",
    "tittel": "Uønsket hendelse",
    "forklaring": "Hendelse som kan medføre tap av verdier – kan være tilsiktet (forårsaket av en trusselaktør) eller utilsiktet (forårsaket av et fenomen).",
    "tags": ["risiko"]
  },
  {
    "id": "valideringsdata",
    "tittel": "Valideringsdata",
    "undertittel": "KI-forordningen",
    "forklaring": "Data brukt til å evaluere et trent KI-system og justere ikke-lærbare parametere, for å unngå undertilpasning eller overtilpasning.",
    "tags": ["ki"]
  },
  {
    "id": "valideringsdatasett",
    "tittel": "Valideringsdatasett",
    "undertittel": "KI-forordningen",
    "forklaring": "Separat datasett eller del av treningsdatasettet – som fast eller variabel oppdeling – brukt til validering av KI-modellen.",
    "tags": ["ki"]
  },
  {
    "id": "verdi",
    "tittel": "Verdi",
    "undertittel": "risikovurdering",
    "forklaring": "Det som må beskyttes – fra nasjonale sikkerhetsinteresser og samfunnsverdier (liv og helse, natur, økonomi, demokrati) til organisasjonens funksjoner, leveringsdyktighet og materielle og immaterielle eiendeler.",
    "tags": ["risiko"]
  },
  {
    "id": "verdihierarki",
    "tittel": "Verdihierarki",
    "forklaring": "Strukturering av verdier i nivåer der overordnede verdier og funksjoner understøttes av underliggende verdier, kritiske funksjoner, infrastruktur og innsatsfaktorer.",
    "tags": ["risiko"]
  },
  {
    "id": "vesentlig-endring-ki",
    "tittel": "Vesentlig endring",
    "undertittel": "KI-forordningen",
    "forklaring": "Endring i et KI-system etter omsetning som ikke var forutsett i den opprinnelige samsvarsvurderingen, og som påvirker systemets samsvar med kravene eller endrer det tiltenkte formålet.",
    "tags": ["ki"]
  },
]

# ── Check for ID conflicts ────────────────────────────────────────────────────
existing_ids = {e['id'] for e in data}
conflicts = [e['id'] for e in NEW if e['id'] in existing_ids]
if conflicts:
    print(f'ID-konflikter: {conflicts}')
    raise SystemExit(1)

# ── Merge and sort ────────────────────────────────────────────────────────────
merged = data + NEW
merged.sort(key=lambda e: e['tittel'].lower().replace('æ','ae').replace('ø','oe').replace('å','aa'))

# ── Write ─────────────────────────────────────────────────────────────────────
with open('public/content/ordbok.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)
    f.write('\n')

print(f'Ferdig. Lagt til {len(NEW)} nye oppføringer. Totalt: {len(merged)} ord.')
print(f'Nye tags i bruk: {sorted(set(t for e in NEW for t in e["tags"]))}')
