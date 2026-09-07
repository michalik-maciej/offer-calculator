window.MAISTER_DATA = {
  generated: "2026-09-06T14:35:39Z",
  task: {
    title: "Gondola layout support in the offer configurator UI",
    type: "development",
    status: "in_progress",
    description:
      "The domain, the Valibot contract and the Polish descriptions for gondolas already exist, but nothing under packages/apps/web references gondolas: a user cannot add one. Scope grew in Phase 1: the maintainer decided gondolas share uprights between sides, as the first calculator did, so the domain calculation changes too.",
    path: ".maister/tasks/development/2026-09-06-gondola-layout-ui",
    current_activity: "Executing implementation",
  },
  characteristics: {
    has_reproducible_defect: false,
    modifies_existing_code: true,
    creates_new_entities: true,
    involves_data_operations: true,
    ui_heavy: true,
  },
  phases: [
    {
      id: "phase-1",
      name: "Analyze codebase & clarify requirements",
      icon_hint: "analysis",
      status: "completed",
      started: "2026-09-06T12:47:03Z",
      completed: "2026-09-06T13:39:19Z",
      skip_reason: null,
      summary:
        "Gondola support is complete below the API boundary and absent above it. Prior art from two earlier calculators settled that gondolaUnits are sides, not segments, and exposed a pricing divergence in how uprights are counted.",
      decisions: [
        {
          decision: "gondolaUnits to strony gondoli, nie segmenty wzdłuż ciągu",
          rationale:
            "Obie wcześniejsze implementacje modelowały ten poziom jako strony, niezależnie od siebie.",
        },
        {
          decision: "Gondola dzieli nogi między strony, jak w v1",
          rationale:
            "Jedna wspólna kolumna nóg, dwa niezależne komplety stóp. Zmienia domenę i jej test.",
        },
        {
          decision: "Obie strony gondoli konfigurowane razem, bez rozdzielania",
          rationale:
            "Jedna konfiguracja stosowana do obu stron. Zgodne z uwagą klienta, że około 90% gondol jest symetrycznych.",
        },
        {
          decision: "Zakres zawężony do gondoli, bez szczytu, pleców i osłon",
          rationale:
            "Każdy z tych punktów wymaga nowych pól w schemacie i migracji zapisanych ofert.",
        },
        {
          decision: 'W interfejsie "Strona", schemat bez przemianowania',
          rationale:
            "Unika migracji, kosztem mylącej nazwy gondolaUnits w kodzie.",
        },
      ],
      risks: [
        "Dzisiejszy calculateGondolaLayoutDemand nie dzieli nóg między strony, a wersja pierwsza kalkulatora dzieliła je na pół. Rozbieżność cenowa wobec zachowania, które działało u klienta.",
        "buildLayoutDescription opisuje wyłącznie pierwszą stronę gondoli, więc opis ciągu o rozjechanych stronach jest niepełny.",
        "Brak jakichkolwiek testów pod packages/apps/web i brak JSDOM w konfiguracji Vitest: poprawność interfejsu weryfikuje się wyłącznie użyciem aplikacji.",
        "Schemat dopuszcza gondolę o rozjechanych stronach, a ten interfejs nie potrafi jej wyrazić. Dziś takich ofert nie ma, ale formularz musi zachować się sensownie, jeśli taka powstanie.",
      ],
      artifacts: [
        { path: "analysis/codebase-analysis.md", label: "Analiza kodu", html: null },
        { path: "analysis/prior-art.md", label: "Prior art z wcześniejszych kalkulatorów", html: null },
        { path: "analysis/client-requirements.md", label: "Uwagi końcowego klienta", html: null },
        { path: "analysis/clarifications.md", label: "Ustalenia z Fazy 1", html: null },
      ],
      gate: null,
    },
    {
      id: "phase-2",
      name: "Analyze gaps & clarify scope",
      icon_hint: "analysis",
      status: "in_progress",
      started: "2026-09-06T13:39:19Z",
      completed: null,
      skip_reason: null,
      summary:
        "Below the API boundary the risk is low: no schema, controller or Prisma change, no migration, no persisted gondola to break. Above it, everything concentrates in one type widening across six files with zero frontend test coverage. With both sides configured together the gondola journey is the wall journey with a different drawing.",
      decisions: [
        {
          decision:
            "Nogi: sufit(liczba stron / 2) razy (liczba regałów + 1) razy liczba ciągów",
          rationale:
            "Dwie strony dzielą kolumnę, wpis jednostronny dostaje pełną, żadnych ułamków na wyjściu.",
        },
        {
          decision: "Sposób dodawania ciągu i rysunek gondoli rozstrzygną makiety",
          rationale: "Decyzje wizualne łatwiej podjąć na obrazku niż z opisu.",
        },
        {
          decision: "Dekompozycję komponentów rozstrzygnie plan implementacji",
          rationale:
            "Planista zobaczy realny rozmiar obu wariantów przy gotowej specyfikacji.",
        },
        {
          decision: "Gondola o rozjechanych stronach nieobsługiwana",
          rationale:
            "Schemat ją dopuszcza, ale nie da się jej dziś utworzyć i nie ma takich ofert.",
        },
      ],
      risks: [
        "Ułamki nie mogą opuścić orkiestracji: calculateBomPrice i breakdownDemandByCategory nie zaokrąglają, więc pół nogi wyszłoby na Rozpiskę jako 0.5.",
        "Dzielenia nóg nie da się zrobić przez delegację, bo calculateWallLayoutDemand liczy plecy, bazy, półki, nogi i stopy w jednym wywołaniu. To jedyne miejsce narażające ścieżkę ścienną na regresję.",
        "Zerowe pokrycie testami pod packages/apps/web, więc poszerzenie typu przez sześć plików nie ma siatki bezpieczeństwa poza kompilatorem.",
      ],
      artifacts: [
        { path: "analysis/gap-analysis.md", label: "Analiza luk", html: null },
        { path: "analysis/scope-clarifications.md", label: "Rozstrzygnięcia zakresowe", html: null },
      ],
      gate: {
        question: "Przejść do Fazy 4: generowanie makiet UI?",
        answer: "Tak, przejdź do makiet",
      },
    },
    {
      id: "phase-3",
      name: "Write failing test (TDD Red)",
      icon_hint: "verify",
      status: "skipped",
      started: null,
      completed: null,
      skip_reason:
        "Brak odtwarzalnego defektu: rozjazd w liczeniu nóg odtwarza się w teście domeny, ale żaden użytkownik nie może go wywołać i żadna zapisana oferta go nie zawiera.",
      summary: null,
      decisions: [],
      risks: [],
      artifacts: [],
      gate: null,
    },
    {
      id: "phase-4",
      name: "Generate UI mockups",
      icon_hint: "spec",
      status: "completed",
      started: "2026-09-06T14:04:30Z",
      completed: "2026-09-06T14:18:22Z",
      skip_reason: null,
      summary:
        "Cztery makiety HTML związane z realnymi tokenami z index.css i prymitywami z core/ui. Dwie z nich rozstrzygnęły odłożone decyzje wizualne. Serwer galerii zamknięty po akceptacji, pliki zostają na dysku.",
      decisions: [
        {
          decision: "Dodawanie ciągu przez dwa przyciski obok siebie",
          rationale:
            "Gondola widoczna od pierwszego wejścia, bez dodatkowego kliknięcia. Każdy przycisk wyłączany niezależnie.",
        },
        {
          decision: "Gondola rysowana jako dwa pasy stykające się plecami",
          rationale:
            "Widać, że to regał dwustronny. Zgodne z geometrią z drugiego kalkulatora i z metaforą rysunku w skali.",
        },
      ],
      risks: [
        "Konfiguracja shadcn w components.json wskazuje nieistniejący tailwind.config.cjs i aliasy @/components/ui, gdy prymitywy leżą w src/core/ui. Martwa konfiguracja, myląca przy dodawaniu nowych komponentów.",
      ],
      artifacts: [
        { path: "analysis/design-context/INDEX.md", label: "Inwentarz makiet", html: null },
        { path: "analysis/design-context/design-resources.md", label: "Odkryty język wizualny", html: null },
        { path: "analysis/design-context/mockups/dodawanie-ci-gu-dwa-warianty.html", label: "Dodawanie ciągu, dwa warianty", html: "analysis/design-context/mockups/dodawanie-ci-gu-dwa-warianty.html" },
        { path: "analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html", label: "Gondola na planie, dwa warianty", html: "analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html" },
        { path: "analysis/design-context/mockups/konfigurator-z-gondol.html", label: "Konfigurator z gondolą", html: "analysis/design-context/mockups/konfigurator-z-gondol.html" },
        { path: "analysis/design-context/mockups/szuflada-edycji-gondoli.html", label: "Szuflada edycji gondoli", html: "analysis/design-context/mockups/szuflada-edycji-gondoli.html" },
      ],
      gate: {
        question: "Które warianty wchodzą do specyfikacji i czy idziemy do Fazy 5?",
        answer:
          "Dwa przyciski obok siebie, gondola jako dwa pasy plecami do siebie, przejście do specyfikacji",
      },
    },
    {
      id: "phase-5",
      name: "Gather requirements & create specification",
      icon_hint: "spec",
      status: "completed",
      started: "2026-09-06T14:18:22Z",
      completed: "2026-09-06T15:02:00Z",
      skip_reason: null,
      summary:
        "Specyfikacja na 367 linii z towarzyszącą wersją HTML. 17 wymagań, 11 komponentów do reużycia, 3 nowe. Typ formularza zwinięty do OfferInput, liczenie nóg wychodzi z kalkulacji ściennej, wynik ścienny zamrożony co do treści i kolejności.",
      decisions: [
        {
          decision: "Zwinąć typ formularza do OfferInput i skasować offer.types.ts",
          rationale:
            "Oferta mieszająca oba typy ciągów sprawia, że każde zawężenie per wariant jest faktycznie fałszywe.",
        },
        {
          decision: "Liczenie nóg wychodzi z calculateWallLayoutDemand",
          rationale:
            "Każda orkiestracja deklaruje własny zasięg zamiast współczynnika ukrytego we wspólnej kalkulacji.",
        },
        {
          decision: "Wynik kalkulacji ściennej zamrożony co do treści i kolejności",
          rationale:
            "Trzy przechodzące testy porównują przez toEqual, więc kolejność jest najtańszym dowodem, że ściana się nie ruszyła.",
        },
        {
          decision: "Jeden edytor sparametryzowany prefiksem ścieżki, dwa osobne komponenty planu",
          rationale:
            "Różnica w edytorze to jeden segment ścieżki, różnica w planie to co rysuje.",
        },
      ],
      risks: [
        "Typowanie ścieżek React Hook Form nad tablicą unii może zamienić poszerzenie typu z mechanicznego w uciążliwe. Sprawdzić przez pnpm typecheck przed pisaniem komponentów.",
        "Wydzielenie liczenia nóg może zmienić kolejność listy zapotrzebowania, a testy porównują przez toEqual. Czerwony test ścienny znaczy ruch kolejności, poprawiać kompozycję, nie oczekiwanie.",
        "Nic z warstwy web nie jest objęte testami: zero testów pod packages/apps/web, brak JSDOM, pokrycie tylko z domeny.",
        "Gondoli o rozjechanych wpisach edytor nie wyrazi: pokaże wpis zerowy, resztę zostawi, więc rysunek pokaże mniej, niż obejmuje cena.",
      ],
      artifacts: [
        { path: "implementation/spec.md", label: "Specyfikacja", html: "implementation/spec.html" },
        { path: "analysis/requirements.md", label: "Zebrane wymagania", html: null },
        { path: "analysis/technical-clarifications.md", label: "Ustalenia techniczne", html: null },
      ],
      gate: null,
    },
    { id: "phase-6", name: "Audit specification", icon_hint: "verify", status: "completed", started: "2026-09-06T15:10:00Z", completed: "2026-09-06T16:40:00Z", skip_reason: null, summary: "Audyt specyfikacji wykrył sprzeczne rozstrzygnięcie techniczne T2 i fałszywą przesłankę w odrzuceniu wariantu z mnożnikiem. Oba poprawione przed planowaniem.", decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-7", name: "Plan implementation", icon_hint: "plan", status: "completed", started: "2026-09-06T16:50:00Z", completed: "2026-09-06T17:45:00Z", skip_reason: null, summary: "Plan na 7 grup i 40 kroków, ściśle sekwencyjny. Planista skorygował specyfikację: ShelvesFields też bierze prefiks ścieżki.", decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-8", name: "Execute implementation", icon_hint: "code", status: "completed", started: "2026-09-06T17:54:11Z", completed: "2026-09-07T00:50:00Z", skip_reason: null, summary: "7 z 7 grup, 47 z 47 kroków. pnpm vitest run 39 przeszło (było 35), pnpm validate zielone, tsc -b --force i lint --force exit 0 wobec cache hitów Turbo. Zero testów komponentów. Wszystko niezastage'owane. Cztery pytania otwarte do maintainera i pięć kryteriów sukcesu czeka na fazę E2E.", decisions: [], risks: [], artifacts: [{ path: "implementation/implementation-plan.md", label: "Plan implementacji", html: "implementation/implementation-plan.html" }, { path: "implementation/work-log.md", label: "Dziennik pracy", html: null }], gate: null },
    { id: "phase-9", name: "Verify test passes (TDD Green)", icon_hint: "verify", status: "skipped", started: null, completed: null, skip_reason: "Faza 3 pominięta, brak odtwarzalnego defektu, więc nie ma czerwonego testu do zazielenienia.", summary: null, decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-10", name: "Prompt verification options", icon_hint: "verify", status: "pending", started: null, completed: null, skip_reason: null, summary: null, decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-11", name: "Verify implementation & resolve issues", icon_hint: "verify", status: "pending", started: null, completed: null, skip_reason: null, summary: null, decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-12", name: "Run E2E tests", icon_hint: "verify", status: "pending", started: null, completed: null, skip_reason: null, summary: null, decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-13", name: "Generate user documentation", icon_hint: "docs", status: "pending", started: null, completed: null, skip_reason: null, summary: null, decisions: [], risks: [], artifacts: [], gate: null },
    { id: "phase-14", name: "Finalize workflow", icon_hint: "done", status: "pending", started: null, completed: null, skip_reason: null, summary: null, decisions: [], risks: [], artifacts: [], gate: null },
  ],
  verification: { status: null, issues: [], fixes: [], reverify_count: 0 },
}
