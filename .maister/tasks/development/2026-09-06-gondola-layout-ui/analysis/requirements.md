# Zebrane wymagania

## TL;DR

Gondola, czyli regał dwustronny, ma dać się dodać, edytować, zobaczyć na planie i wycenić.
W tej iteracji jest zawsze symetryczna: jedna konfiguracja stosowana do obu stron. Dochodzi
poprawka wyceny w domenie, bo gondola dzieli kolumnę nóg między strony. Szczyty, podwójne plecy,
osłony i walidacja głębokości półek zostają poza zakresem.

## Key Decisions

- Dodawanie przez dwa przyciski obok siebie, gondola widoczna od pierwszego wejścia.
- Plan rysuje dwa pasy stykające się plecami, oba z tej samej konfiguracji.
- Nagłówek ciągu identyczny dla obu typów, wyciągnięty do wspólnego komponentu.
- Domyślna gondola powstaje tak jak domyślny ciąg przyścienny, tylko dwustronnie.

## Open Questions / Risks

- Sposób poszerzenia typu formularza celowo nierozstrzygnięty: decyzja należy do specyfikacji.
- Zerowe pokrycie testami frontendu: poprawność interfejsu weryfikuje się wyłącznie użyciem
  aplikacji, co czyni fazę E2E jedyną realną bramką dla warstwy widoku.

---

## Opis wyjściowy

Konfigurator ofert w `packages/apps/web` zna dziś wyłącznie ciągi przyścienne. Domena już wycenia
gondole (`calculateGondolaLayoutDemand` z testem), kontrakt istnieje
(`packages/schemas/src/LayoutGondola.schema.ts`), a `buildLayoutDescription` produkuje polski opis
„N x ciąg regałów dwustronnych". Brakuje wyłącznie interfejsu: użytkownik nie ma jak dodać gondoli.

## Wymagania funkcjonalne

1. **Dodanie gondoli.** Obok „Dodaj ciąg przyścienny" stoi „Dodaj gondolę". Każdy przycisk jest
   wyłączany niezależnie, gdy magazyn komponentów nie pozwala zbudować danego typu, a podpowiedź
   mówi, którego typu brakuje.
2. **Domyślna gondola.** Najmniejsza wysokość, najmniejsza głębokość i najmniejsza szerokość
   z katalogu, jeden regał, liczba półek z tabeli domyślnych, `numberOfGondolaUnits` równe dwa.
   Fabryka zwraca `null`, gdy magazyn nie pozwala, dokładnie jak fabryka ścienna, żeby logika
   wyłączania przycisku pozostała jednolita.
3. **Plan gondoli.** Widok z góry, skala 1.6 px na centymetr, dwa pasy prostokątów stykające się
   plecami, oba wyrenderowane z tej samej konfiguracji. Podpisy stron: „Strona 1" i „Strona 2".
   Kliknięcie prostokąta otwiera prawą szufladę, jak w ciągu przyściennym.
4. **Edycja.** Jedna konfiguracja dla obu stron: głębokość bazy, wysokość, szerokość regału, liczba
   regałów, półki, inne elementy ciągu. W szufladzie stoi nota, że zmiany dotyczą obu stron.
5. **Nagłówek ciągu identyczny dla obu typów**: numer w `Badge`, opis z domeny, pole „Liczba
   ciągów", cena przez `formatPrice`, powielanie i usuwanie.
6. **Wycena.** Gondola dzieli kolumnę nóg między strony, zgodnie z regułą
   `sufit(numberOfGondolaUnits / 2) * (liczba regałów + 1) * numberOfLayouts` na wpis. Stopy
   pozostają liczone w pełni na każdą stronę.

## Ścieżka użytkownika

Logowanie, oferta nowa albo wczytana, przejście do Konfiguratora, kliknięcie „Dodaj gondolę",
pojawia się ciąg z domyślną konfiguracją i rysunkiem dwóch stron, kliknięcie prostokąta otwiera
szufladę, zmiana wymiarów, po 800 ms autozapis wysyła całą ofertę na serwer, wraca wycena, cena
w nagłówku i pozycje w Rozpisce się aktualizują. Wycena nigdy nie liczy się w przeglądarce.

## Co reużywamy

- `WallLayoutPlan.tsx` jako wzorzec planu, z nagłówkiem wyciągniętym do wspólnego komponentu.
- `ShelfUnitEditor.tsx` i jego lokalne kontrolki: `OptionStepper`, `CountStepper`,
  `SectionNavigator`, `SectionLabel`, `ValueDisplay`, `ShelvesFields`.
- `ExtrasFields.tsx` bez zmian strukturalnych, ścieżka `layouts.${i}.extras` jest identyczna
  w obu schematach.
- `createDefaultWallLayout.ts` jako wzorzec fabryki, z tym samym kontraktem „null znaczy nie da się".
- `useInventoryDimensions.ts` bez zmian: gondola ogranicza dokładnie te same cztery wymiary.
- `isLayoutWall` i `isLayoutGondola` z `packages/schemas` jako jedyny sankcjonowany sposób
  rozróżniania wariantów po stronie interfejsu.
- Prymitywy z `core/ui`, w tym nieużywany dziś `radio-group.tsx`, gdyby wrócił wybór typu.

## Materiały wizualne

Cztery makiety w `analysis/design-context/mockups`, zinwentaryzowane w
`analysis/design-context/INDEX.md`, wiążące dla implementacji. Wybrane warianty: dwa przyciski
dodawania oraz dwa pasy na planie.

## Granice zakresu

Poza tą iteracją, każde jako osobne zadanie: szczyt gondoli, podwójne plecy, osłona dolna i górna,
walidacja „półka nie głębsza niż baza", menu pod prawym przyciskiem myszy, przeprojektowanie okna
półek, kolejność w szufladzie, stały opis na dole ekranu, gondole asymetryczne oraz akcja
„rozłącz gondolę".

## Uwarunkowania techniczne

- Poszerzenie typu formularza: dwa warianty w `analysis/technical-clarifications.md`, wybór należy
  do specyfikacji.
- Wydzielenie liczenia nóg z `calculateWallLayoutDemand`, z testem pilnującym niezmienionego wyniku
  dla ciągu przyściennego.
- Żadnych nowych importów z `@/domain` w warstwie web: standard nazywa jedenaście istniejących
  długiem do spłacenia.
- Cały tekst widoczny dla użytkownika po polsku, w słownictwie już obecnym w aplikacji.
