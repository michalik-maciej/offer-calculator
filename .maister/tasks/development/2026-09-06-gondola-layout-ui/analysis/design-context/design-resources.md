# Odkryty język wizualny projektu

## TL;DR

Projekt ma własny, kompletny system: shadcn w wariancie „new-york" na bazie slate, zmienne CSS w
`src/index.css` wystawione jako motyw Tailwinda v4, jedenaście prymitywów w `src/core/ui/` i ikony
lucide. Makiety mają z tego korzystać po nazwach, nie wymyślać własnego wyglądu. Standardy
frontendowe z `.maister/docs/standards/frontend/` są wiążące, w szczególności reguła, że każdy
tekst widoczny dla użytkownika jest po polsku.

## Key Decisions

- Makiety odwzorowują istniejące zmienne CSS i klasy Tailwinda po ich prawdziwych nazwach.
- Prymitywy z `core/ui` są przywoływane po nazwach plików, żeby implementacja wiedziała, co reużyć.
- Nie konsultowałem zewnętrznych skilli projektowych: projekt ma własny system, więc generyczna
  paleta tylko by go rozmyła.

## Open Questions / Risks

- `components.json` wskazuje `tailwind.config.cjs`, a plik nazywa się `tailwind.config.ts`, oraz
  aliasy `@/components/ui`, gdy prymitywy leżą w `src/core/ui`. Konfiguracja shadcn jest martwa
  i wprowadza w błąd, ale nic z niej dziś nie korzysta.

---

## Tier 1: standardy projektu (wiążące)

Z `.maister/docs/INDEX.md`, sekcja standardów frontendowych:

| Ścieżka | Temat |
| --- | --- |
| `.maister/docs/standards/frontend/components.md` | organizacja po funkcjach, props inline i alfabetycznie, formularze na React Hook Form dzielone przez kontekst, trasy eksportujące `Route` |
| `.maister/docs/standards/frontend/language.md` | każdy tekst widoczny dla użytkownika po polsku, `Intl` z `pl-PL` na liczbach i datach |
| `.maister/docs/standards/frontend/css.md` | praca z frameworkiem zamiast przeciw niemu, tokeny, minimum własnego CSS |
| `.maister/docs/standards/frontend/accessibility.md` | semantyczny HTML, nawigacja klawiaturą, kontrast, etykiety |
| `.maister/docs/standards/frontend/responsive.md` | mobile-first, płynne układy, jednostki względne |
| `.maister/docs/standards/frontend/data-fetching.md` | kontrakty `createApiMethod`, klucze zapytań, komunikaty błędów po polsku |

## Tier 2: system w kodzie

| Rodzaj | Ścieżka | Uwaga |
| --- | --- | --- |
| `css-var` | `packages/apps/web/src/index.css` | pełny zestaw shadcn: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--card`, `--popover`, plus `--radius` w czterech rozmiarach. Wystawione jako `--color-*` dla motywu Tailwinda v4. |
| `tailwind` | `packages/apps/web/tailwind.config.ts` | Tailwind v4 przez `@tailwindcss/vite`, konfiguracja minimalna, wtyczka `tailwindcss-animate` |
| `component-lib` | `packages/apps/web/src/core/ui/` | `accordion`, `badge`, `button`, `confirm-dialog`, `dialog`, `drawer`, `input`, `label`, `radio-group`, `select`, `toaster`, plus `utils.ts` z mergerem `cn()` |
| `component-lib` | `packages/apps/web/components.json` | shadcn „new-york", baza slate, `cssVariables: true`, ikony lucide. Ścieżki w tym pliku są nieaktualne. |
| `icon-lib` | `lucide-react` | jedyny zestaw ikon w projekcie |

Wzorce z istniejącego konfiguratora, które makieta ma odwzorować:

- Rysunek planu w widoku z góry, skala `SCALE_PX_PER_CM = 1.6`, prostokąty regałów o wysokości
  `głębokość * 1.6` i szerokości `szerokość * 1.6`.
- Nagłówek ciągu: `Badge` z numerem, opis z domeny, pole „Liczba ciągów", cena przez `formatPrice`
  z `Intl.NumberFormat("pl-PL", { currency: "PLN" })`, ikony powielania i usuwania.
- Edycja w prawej szufladzie (`Drawer direction="right"`), otwieranej klikiem w prostokąt regału.
- Steppery: para przycisków ze strzałkami wokół wartości, osobno dla wymiarów z katalogu
  i osobno dla liczników.

## Tier 3: dostępne skille i narzędzia projektowe

| Rodzaj | Nazwa | Dlaczego pasuje |
| --- | --- | --- |
| skill | `design` | kanwa projektowa Claude Design, do makiet wieloekranowych |
| skill | `artifact-design` | zasady projektowania stron publikowanych jako artefakt |
| skill | `dataviz` | wykresy, nieistotne przy tym ekranie |
| agent | `maister:ascii-mockup-generator` | ścieżka zapasowa, gdyby zabrakło Node'a |
| mcp-tool | Playwright | otwarcie galerii makiet w przeglądarce |

Żadnego z nich nie konsultowałem po paletę: projekt ma własny system tokenów, więc zewnętrzna
paleta wprowadziłaby rozjazd zamiast spójności. Playwright wykorzystany zgodnie z przeznaczeniem,
do otwarcia galerii.
