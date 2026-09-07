# Work Log

## 2026-09-06T17:54:11Z - Implementation Started

**Total Steps**: 40
**Task Groups**: 1 domena i wspólne nogi, 2 poszerzenie typu formularza, 3 wyciągnięcie wspólnych
części planu, 4 fabryka gondoli i dwa przyciski, 5 sparametryzowanie edytora prefiksem ścieżki,
6 plan gondoli, dyspozytor i szuflada, 7 przegląd testów i weryfikacja kryteriów sukcesu

**Execution mode**: sekwencyjny, po jednej grupie. Powód: `OfferLayouts.tsx`, `WallLayoutPlan.tsx`
i `ShelfUnitEditor.tsx` są dotykane przez dwie albo trzy grupy każdy, więc fale równoległe
kolidowałyby na plikach.

**Task items**: nieutworzone. Narzędzia `TaskCreate` i `TaskUpdate` nie są dostępne w tym harnessie.
Powierzchnią śledzenia są checkboxy w `implementation-plan.md` oraz znaczniki `data-group`
i `data-step` w towarzyszącym HTML.

## Standards Reading Log

### Loaded Per Group

#### Grupa 1: domena i wspólne nogi

**Z planu implementacji**: `backend/domain.md`, `testing/test-writing.md`, `global/coding-style.md`,
`global/commenting.md`, `global/minimal-implementation.md`, `workflow/process.md`.

**Z INDEX.md**: `workflow/git.md`, dopasowanie po temacie grupy.

**Odkryte w trakcie wykonania**:
- `global/coding-style.md`, sekcja o nazywaniu liczb, krok 1.3: `Math.ceil(n / 2)` stawia gołą
  dwójkę w miejscu użycia, więc powstała stała `SIDES_PER_UPRIGHT_COLUMN`.
- `global/coding-style.md`, sekcja o lodash/fp, krok 1.1: sprawdzenie całkowitości w teście to praca
  na kolekcji wewnątrz domeny, więc `every` z `lodash/fp` zamiast metody natywnej.
- `global/commenting.md`, sekcja o JSDoc, krok 1.2: opcjonalny parametr, którego brak zmienia
  wycenę, to zaskoczenie na powierzchni publicznej, czyli dokładnie przypadek zarezerwowany dla
  JSDoc.

---

## 2026-09-06T17:54:11Z - Grupa 1 zakończona

**Kroki**: 1.1 do 1.5, komplet.

**Testy**: `pnpm vitest run` 38 przeszło w 17 plikach, było 35. `pnpm validate` zielone.

**Zasięg zmian**: dokładnie trzy pliki w `packages/domain`, 127 dodanych linii, 3 usunięte.
`calculateWallLayoutDemand.test.ts` nie pojawia się w `git status`, więc kryterium sukcesu numer 6
jest spełnione: w całym repozytorium zmieniła się jedna wcześniej istniejąca asercja, `leg-130-8-3`
z 8 na 4.

**Zweryfikowane niezależnie przez orkiestratora**: `git diff --stat`, brak zmian w teście ściennym,
jedna zmieniona asercja wśród wcześniej istniejących, pełny przebieg testów.

**Decyzje wykonawcy**:
- Zasięg nóg wszedł jako klucz kontekstu `numberOfLegLayouts` z wartością domyślną w destrukturyzacji,
  więc ścieżka ścienna jest chroniona konstrukcją, nie dyscypliną wywołującego.
- Typ kontekstu nazwany `WallLayoutCalculationContext`, zgodnie z rodziną `{Name}CalculationContext`
  używaną już przez `calculateFootDemand`.
- Test (c) zbudowany na kształcie, w którym obie liczby nie mogą się zbiec: dwie strony, trzy regały,
  dwa ciągi dają stopy 16 i nogi 8 w jednym wyniku. Istniejący fixture tego nie łapał.

**Odstępstwo od planu**: dodany blok JSDoc nad `calculateWallLayoutDemand`, którego plan nie
zamawiał i którego nie ma żadna inna orkiestracja w pakiecie. Uzasadnienie wykonawcy: opcjonalny
parametr zmieniający cenę jest zaskoczeniem na powierzchni publicznej. Zgłoszone do decyzji
maintainera.

**Nieudowodnione**: kryteria sukcesu 4 i 5 są kryteriami przeglądarkowymi i pozostają
nieudowodnione do fazy E2E. Ta grupa była weryfikowana wyłącznie statycznie i testami.

---

## 2026-09-06 - Grupa 2 zakończona

**Kroki**: 2.1 do 2.6, komplet. Testu nie napisano i nie da się go tu napisać.

**Bramka**: `pnpm typecheck` zielony bez ani jednego dodanego rzutowania. `pnpm validate` zielone,
`pnpm vitest run` 38 przeszło. `grep -rn 'WallOfferInput' packages/apps/web/src` nie zwraca nic,
`offer.types.ts` nie istnieje.

**Obie podejrzane powierzchnie typowania przeszły bez wyjścia awaryjnego**: `FieldPathByValue` nad
unią rozwiązuje ścieżki obu wariantów, a trzy wywołania `useFieldArray` na ścieżkach tablicowych
istniejących tylko w jednym członie unii rozwiązują się przez `ArrayPath` i `FieldArray`.

**Zniknął przy okazji błąd niezależny od gondoli**: `reset(offer.input as WallOfferInput)`
w `OfferFormProvider`, które rzutowało zapisaną gondolę na typ ścienny przy wczytaniu.

**Regresja wykryta i celowo nienaprawiona w tej grupie**: guard `isLayoutWall` to pełna walidacja
schematem, nie sprawdzenie kształtu. Skasowanie zawartości pola „Liczba ciągów" daje przez
`valueAsNumber` wartość `NaN`, która oblewa `minValue(0)`, więc guard zwraca fałsz i cały komponent
ciągu zwraca `null` razem z polem, w którym użytkownik właśnie kasował. Ciąg znika do przeładowania
strony. Wcześniej guard brzmiał `if (!layout)` i ta sama edycja pokazywała pusty prostokąt.

Zweryfikowane niezależnie przez orkiestratora na zainstalowanym Valibocie: `NaN` i `undefined`
oblewają `minValue(0)`. Steppery są bezpieczne, bo idą przez `Controller` po stałej liście opcji.
Ekspozycja to dokładnie to jedno pole.

**Zgłoszone dodatkowo przez wykonawcę**: `isLayoutWall` uruchamia teraz pełny `safeParse` całego
layoutu przy każdym renderze każdego ciągu, co przy obecnych rozmiarach jest bez znaczenia, ale
warto pamiętać. Oraz, niezależnie od tej zmiany, `NaN` w `numberOfLayouts` serializuje się do `null`
w ciele autozapisu i serwer je odrzuca, dając toast o nieudanym zapisie.

---

## 2026-09-06 - Grupa 3 zakończona

**Kroki**: 3.1 do 3.5, komplet. Refaktor czysty, zero testów z założenia.

**Bramka**: `pnpm validate` zielone, `pnpm vitest run` 38 przeszło. `WallLayoutPlan.tsx` z 214 linii
na 148, trzy nowe pliki: `planScale.ts` (1 linia), `ShelvesSummary.tsx` (28), `LayoutPlanHeader.tsx`
(68). `SCALE_PX_PER_CM` deklarowana w repozytorium dokładnie raz.

**Naprawa regresji z grupy 2, dopisana do kroku 3.4 przez orkiestratora**: guard `isLayoutWall`
zastąpiony sprawdzeniem kształtu `if (!layout || "gondolaUnits" in layout) return null`. Powód:
pełny `safeParse` oblewał się na `NaN` w trakcie kasowania pola i odmontowywał edytowany ciąg.
Sprawdzenie tokenem nie ma dostępu do wartości pól, więc kasowanie treści pola już nic nie odmontowuje.

**Dryf planu wobec kodu, odnotowany zamiast przepisywania historii**: krok 2.3 zamawiał guard
schematem i po tej naprawie mówi nieprawdę. Dopisano do niego `**SUPERSEDED during Group 3**`,
a do kroku 3.4 `**Added to this step by the orchestrator**`.

**Zweryfikowane niezależnie przez orkiestratora**: liczba linii przed i po, jedno wystąpienie
`SCALE_PX_PER_CM`, brak zmian w treści widocznej dla użytkownika w diffie.

**Nieudowodnione**: identyczność wizualna ciągu przyściennego to kryterium przeglądarkowe.
Sprawdzenie „skasuj Liczbę ciągów, karta zostaje zamontowana" przechodzi do fazy E2E.

---

## 2026-09-06 - Grupa 4 zakończona

**Kroki**: 4.1 do 4.6, komplet.

**Bramka**: `pnpm validate` zielone, `pnpm vitest run` 38 przeszło.

**Zweryfikowane niezależnie przez orkiestratora**:
- `createDefaultGondolaLayout.ts` istnieje i zawiera **zero spreadów**, czyli pułapka obiektu
  hybrydowego (`gondolaUnits` razem z `depth` i `shelfUnits` na poziomie ciągu) jest ominięta
  konstrukcją, nie dyscypliną.
- `grep -rn 'from "@/domain' packages/apps/web/src` zwraca **11** linii, tyle samo co przed grupą.
  Kryterium akceptacji spełnione.
- Oba przyciski i podtytuł obecne w `OfferLayouts.tsx`, linie 46, 55 i 59. Plik urósł z 51 do 75 linii.
- Brak pozostałości po jednorazowej sondzie `tsx`, której wykonawca użył do dowodu.

**Dowód statyczny zamiast przeglądarkowego**: wykonawca nie miał przeglądarki, więc przepuścił
dokładny kształt obiektu z fabryki przez `OfferInputSchema` i pokazał `parse success: true`,
`isLayoutGondola: true`, `isLayoutWall: false`, z kompletem kluczy przeżywającym rundę. To dowodzi,
że schemat i serwer przyjmą tę gondolę, ale **nie zastępuje** checkpointu 4.6 na stronie oferty.

**Nieudowodnione**: runda „Dodaj gondolę" → autozapis → opis „1 x ciąg regałów dwustronnych" z ceną
na stronie oferty. Przechodzi do fazy E2E razem z kryteriami sukcesu 1 do 5.

**Zgłoszone przez wykonawcę do decyzji maintainera** (nie blokuje grupy 5):
1. Umiejscowienie przycisków. Makieta `konfigurator-z-gondol.html` stawia je w wierszu tytułu
   „Konfigurator". Żeby to zrobić, `packages/apps/web/src/routes/config.tsx` musiałby wejść
   do `Files to Modify` którejś grupy. Dziś przyciski są tam, gdzie był pojedynczy „Dodaj ciąg".
2. Sprzeczność między makietami co do przycisku głównego: w jednej primary jest „Dodaj ciąg
   przyścienny", w drugiej „Dodaj gondolę". Krok 4.2 zamawiał `variant="outline"` i oba takie są.

---

## 2026-09-07 - Grupa 5 zakończona

**Kroki**: 5.1 do 5.6, komplet. Testów nie dodano i nie da się ich tu dodać (brak JSDOM, decyzja
projektowa o nietestowaniu komponentów).

**Bramka**: `pnpm validate` zielone, `pnpm vitest run` 38 przeszło w 17 plikach.

**Zweryfikowane niezależnie przez orkiestratora**:
- `grep -c 'layouts\.\${layoutIndex}\.shelfUnits'` w `ShelfUnitEditor.tsx` zwraca **0**. Kryterium
  akceptacji „żadna ścieżka ścienna nie zostaje w edytorze" spełnione.
- Sześć ścieżek przeprefiksowanych (216, 222, 311, 322, 342, 347), dwie celowo nieruszone
  (213 i 327, obie `layouts.${layoutIndex}.height`). Zgadza się z audytem wykonawcy co do linii.
- **Zero dodanych rzutowań.** Jedyne `as const` w diffie stało już w `HEAD` na linii 216 tego samego
  wyrażenia, sprawdzone przez `git show HEAD:...`. To asercja stałej zachowująca literalność dla
  `FieldPathByValue`, nie rzutowanie typu.
- Propsy alfabetycznie w obu komponentach: `unitsPath` po `unitIndex` w destrukturyzacji i w typie.
- `grep -rn 'from "@/domain' packages/apps/web/src` nadal **11**.
- W diffie tej grupy nie ma ani jednej zmiany stringa widocznego dla użytkownika. Zmiana jest
  zamknięta w wyrażeniach `name=`, dwóch deklaracjach propsów i jednym przekazaniu w dół.
- `pnpm --filter web exec tsc -b --force` osobno, exit 0. Powód: `pnpm validate` trafił w cache Turbo
  („FULL TURBO"), a typecheck jest jedyną automatyczną bramką tej grupy, więc cache trzeba było obejść.
- Brak pozostałości po sondzie typów, którą wykonawca skasował.

**Krok 5.5 rozstrzygnięty na ścieżce głównej**: unia dwuczłonowa rozdystrybuowała się przez template
literal bez wyjścia awaryjnego. Wykonawca dodatkowo udowodnił sondą typową, że
`FieldPathByValue<OfferInput, number>` faktycznie dyskryminuje na tej unii, zamiast degradować się do
`string`: ścieżka gondoli i ścieżka ścienna do `width` przechodzą, `gondolaUnits.{n}.depth` przechodzi,
a nieistniejące `gondolaUnits.{n}.height` **nie** przechodzi. To zamienia czysty typecheck z braku
skargi w dowód.

**Nieudowodnione**: cała bramka przeglądarkowa kroku 5.6. Otwarcie szuflady, zmiana głębokości bazy,
wysokości, szerokości i liczby regałów, dodanie i usunięcie półki, dodanie i usunięcie elementu,
powielenie i usunięcie regału, oraz cena wracająca z autozapisu. Argument statyczny jest mocny: dla
ścieżki ściennej `unitsPath` to `layouts.${layoutIndex}`, więc każdy przeprefiksowany szablon odtwarza
bajt w bajt string, który zastąpił. Ale to argument, nie obserwacja. **Regresja ścienna pozostaje
do sprawdzenia w fazie E2E.**

**Zgłoszone przez wykonawcę do decyzji maintainera** (nie blokuje grupy 6, ale grupa 6 buduje szufladę
gondoli z tej makiety): makieta `szuflada-edycji-gondoli.html` w sekcji „Regały" pokazuje „Szerokość"
i „Liczba regałów", ale **pomija przycisk „Dodaj regały"**, który istnieje w dzisiejszej szufladzie
i po tej grupie nadal istnieje. Wykonawca nie ruszył kodu, bo wiążącym kryterium jest parytet
z obecną szufladą ścienną. Do potwierdzenia, czy pominięcie było zamierzone dla wariantu gondoli,
czy to przeoczenie makiety.

---

## 2026-09-07 - Grupa 6 zakończona

**Kroki**: 6.1 do 6.7, komplet. Ostatnia grupa implementacyjna.

**Bramka**: `pnpm --filter web exec tsc -b --force` exit 0, `pnpm validate` zielone,
`pnpm vitest run` 38 przeszło. Wykonawca uruchomił wymuszony typecheck sam, orkiestrator powtórzył.

**Zweryfikowane niezależnie przez orkiestratora**:
- `grep -rn 'isLayoutGondola\|isLayoutWall' packages/apps/web/src` zwraca **0**. Walidacja schematem
  nie weszła do warstwy web, mimo że plan ją zamawiał w krokach 6.1 i 6.5.
- Trzy sprawdzenia kształtu, każde inline, zgodnie z krokiem 3.4:
  `WallLayoutPlan.tsx:61` (`"gondolaUnits" in layout` → null),
  `GondolaLayoutPlan.tsx:66` (negacja tego samego),
  `OfferLayouts.tsx:31` (rozgałęzienie dyspozytora).
- Oba sprawdzenia w `GondolaLayoutPlan` stoją **po** wszystkich wywołaniach hooków, więc wczesny
  `return null` nie łamie kolejności hooków przy zmianie kształtu.
- Dyspozytor czyta `getValues(\`layouts.${index}\`)`, nie snapshot `field` z `useFieldArray`.
- Jedno zaznaczenie na obie strony: podświetlenie zależy wyłącznie od `selectedUnitIndex === unitIndex`,
  bez współrzędnej strony. Klucze `${unitField.id}-${copyIndex}-${side}` unikalne w obu pasach.
- Głębokość z `gondolaUnit.depth`, wysokość z `layout.height`. `layout.depth` nie istnieje na tym
  kształcie i nigdzie się nie pojawia.
- `LayoutPlanHeader.tsx` nie zawiera ani jednego wystąpienia słowa „gondola". Nagłówek jest wspólny
  bez rozgałęzienia na wariant, tak jak wymaga kryterium akceptacji.
- Trzy nowe stringi dosłownie z makiet: „Strona 1" (linia 125), „Strona 2" (130),
  „Zmiany dotyczą obu stron gondoli." (145). Żaden nie został wymyślony.
- `grep -rn 'from "@/domain' packages/apps/web/src` nadal **11**.
- `GondolaLayoutPlan.tsx` ma 170 linii, `ShelfUnitEditor.tsx` nietknięty przez tę grupę.

**Decyzje wykonawcy**:
- `UnitsPath` **nie został wyeksportowany**, choć krok to dopuszczał. `as const` na złożonej ścieżce
  daje typ `layouts.${number}.gondolaUnits.0`, przypisywalny do lokalnej unii, więc drugi konsument
  typu nadal nie istnieje i publiczna powierzchnia modułu nie urosła.
- `getValues` zamiast `useWatch` w dyspozytorze. `useWatch({ name: 'layouts' })` przerenderowywałby
  całą listę kart przy każdym naciśnięciu klawisza. `getValues` czyta żywy magazyn RHF, a `fields`
  wymusza render po `append`/`insert`/`remove`, czyli w jedynych momentach, w których rodzaj layoutu
  pod indeksem może się zmienić.

**Krok 6.6, audyt kształtu spoza zakresu** (czytanie ścieżki kodu, bez fixture, bez nowego kodu):
gondola z rozbieżnymi wpisami `gondolaUnits` przeżywa ten edytor. `useWatch` czyta całą wartość,
`useFieldArray` jest przypięty do `gondolaUnits.0.shelfUnits`, edytor pisze wyłącznie pod wpis zero
albo poziom ciągu, `numberOfGondolaUnits` nie jest rejestrowane nigdzie, a powielanie klonuje całą
wartość ciągu przez `structuredClone(getValues(...))`.

**Zgłoszone przez wykonawcę, świadomie niewykonane**:
1. Sprawdzenie kształtu stoi teraz w trzech miejscach. Helper dopiero przy czwartym konsumencie
   i musiałby być zwykłym predykatem kształtu, nie opakowaniem `isLayoutGondola`, inaczej wraca
   pułapka z grupy 2.
2. **Dostępność dwóch pasów.** „Strona 1" i „Strona 2" są dziś dekoracyjne: nic nie wiąże ich
   z konkretnym pasem dla czytnika ekranu, a oba pasy renderują identyczne przyciski o identycznej
   treści, więc czytnik przeczyta każdy regał dwa razy bez informacji, że to ta sama konfiguracja.
   Wykonawca nie dodał `aria-hidden` ani `aria-label`, bo żadna makieta tego nie zamawia,
   a R15 zabrania wymyślania stringów. Do decyzji maintainera jako osobny krok.

**Nieudowodnione, bramka przeglądarkowa w całości**: dwa pasy o poprawnych wymiarach na ekranie,
klik na drugim pasie podświetlający kopię na pierwszym (R5), widoczność notatki o symetrii (R6),
powielenie gondoli dające drugą kartę gondoli (R9), brak ułamkowych ilości w rozpisce, brak
wizualnego przełamania między kartą ścienną a gondolową, oraz to, że kasowanie „Liczby ciągów"
na karcie gondoli jej nie wygasza. Kod na ostatnie odpowiada konstrukcją, ale nie zostało wyklikane.
Wszystko to jest scenariuszem fazy E2E, razem z kryteriami sukcesu 1 do 5.

---

## 2026-09-07 - Grupa 7 zakończona

**Kroki**: 7.1 do 7.5, komplet.

**Wynik przeglądu (7.1)**: cztery testy z grupy 1 spełniają wszystkie cztery kryteria standardu:
`toEqual` na całym wyniku, zero mocków, fixture z pakietu domeny, sąsiedztwo przedmiotu. Zgłoszona
kosmetyka, nienaprawiona: `toHaveLength(11)` jest zbędne obok `toEqual` w linii niżej, ten sam wzorzec
stoi w `calculateWallLayoutDemand.test.ts` z `toHaveLength(12)`. Preegzystujące, osobny krok.

**Luka znaleziona i zamknięta (7.2)**: jedna prawdziwa, jeden test dodany, limit wynosił 2.

Wszystkie cztery istniejące testy są **jednakowo spełnione przez fizycznie błędny wzór**
`ceil(numberOfGondolaUnits * numberOfLayouts / 2)` zamiast poprawnego
`ceil(numberOfGondolaUnits / 2) * numberOfLayouts`. Sprawdzone przypadek po przypadku: (a) 1 wobec 1,
(a) drugi wpis 1 wobec 1, (b) 3 wobec 3, (c) 2 wobec 2, (d) 2 wobec 2. Identycznie wszędzie. Wzory
rozjeżdżają się dopiero, gdy liczba stron jest nieparzysta **i** liczba ciągów przekracza jeden.

Znaczenie fizyczne: zaokrąglenie raz na wszystkie ciągi udaje, że dwie osobne gondole stojące
w różnych miejscach dzielą jedną kolumnę nóg. Poprawnie każda kopia ciągu zaokrągla własną resztę
w górę. Refaktor do zwięźlej wyglądającej postaci z jednym `ceil` przeszedłby dziś na zielono
i zaniżałby nogi na każdej nieparzystostronnej gondoli w wielu ciągach.

Dodany test `rounds the odd side up within each run copy, not across them`:
`numberOfLayouts: 2`, `numberOfGondolaUnits: 3`, poprawna odpowiedź 12 nóg, błędny wzór daje 9.

**Zweryfikowane niezależnie przez orkiestratora**:
- `pnpm vitest run`: **39 przeszło** w 17 plikach, było 38.
- `git diff --name-status | grep test` zwraca **jeden** plik testowy.
- `git diff | grep '^-'` wśród asercji zwraca **jedną** linię: `{ id: "leg-130-8-3", quantity: 8 }`.
  Kryterium sukcesu 6 spełnione: w całym repozytorium zmieniła się jedna wcześniej istniejąca asercja.
- SC 7: `offer.types.ts` nie istnieje, `grep -rn "WallOfferInput" packages/` zwraca 0 trafień.
- SC 8: `grep -rn 'from "@/domain' packages/apps/web/src` zwraca **11**, a
  `git diff | grep -cE '^[+-].*from "@/domain'` zwraca **0**, czyli ani jeden z tych jedenastu
  nie został dodany ani usunięty. To mocniejszy dowód niż sama liczba.
- Arytmetyka nowego testu potwierdzona wobec implementacji: `ceil(3/2) * 2 = 4` zasięgi nóg,
  `(2 + 1) * 4 = 12` nóg. Wzór zwięzły dałby `ceil(6/2) = 3` i `9`. Test faktycznie dyskryminuje.

**Cache Turbo okazał się realnym problemem, nie hipotetycznym.** `pnpm validate` wypisuje
`web:typecheck: cache hit, replaying logs`, czyli odtwarza stary sukces zamiast typecheckować.
Dlatego bramką tej grupy jest `pnpm --filter web exec tsc -b --force` (exit 0) oraz
`pnpm lint --force` (`cache bypass, force executing` na wszystkich czterech pakietach, exit 0),
a nie samo `pnpm validate`. **Ta obserwacja powinna trafić do standardu `workflow/process.md`.**

**Podział weryfikacji (7.5), stan na koniec fazy 8**

*Udowodnione przez `pnpm vitest run`, 39 testów na realnym kodzie*: reguła wspólnej kolumny nóg;
zaokrąglanie per kopia ciągu, nie zbiorczo; stopy, plecy, półki bazowe i półki pełne na stronę;
całkowitość wszystkich ilości przy nieparzystej liczbie stron; niezmieniona ścieżka ścienna
(`calculateWallLayoutDemand.test.ts` nietknięty i zielony, więc wartość domyślna `numberOfLegLayouts`
jest gwarancją testowaną, nie założeniem); niezmieniona cena ścienna na poziomie domeny.

*Udowodnione wyłącznie statycznie, przez `pnpm validate` i wymuszony typecheck*: całe SC 7 i SC 8;
to, że pięć nowych i pięć zmodyfikowanych plików widoku kompiluje się pod `strict`
i `noUncheckedIndexedAccess`, przechodzi lint i jest sformatowane. **To, że hydratacja oferty działa,
nie jest udowodnione. Udowodnione jest tylko, że rzutowanie zniknęło.**

*Wymagające działającej aplikacji, nieudowodnione niczym, co tu uruchomiono*: kryteria sukcesu 1 do 5
w komplecie. Dodatkowo, poza planem: **nic w `validate` ani w CI nie buduje bundla web**, więc zmiana,
która przechodzi typecheck, nadal może wywalić `vite build` i objawi się dopiero na Vercelu.

**Proponowany commit** (do wykonania przez maintainera, agent nie commituje):

```
feat: add gondola layout configuration to the offer UI

Draws a gondola run as two mirrored strips, shares one upright column
between the two sides, and drops the WallOfferInput cast from the offer
hydration path.
```

---

## 2026-09-07 - Implementacja zakończona

**Kroki**: 47 z 47 odhaczone, 7 z 7 grup zamkniętych.
**Testy**: `pnpm vitest run` 39 przeszło w 17 plikach, było 35 na starcie zadania.
Cztery testy dodane w grupie 1, jeden w grupie 7, jedna wcześniej istniejąca asercja przesunięta.
**Bramki**: `pnpm validate` zielone, `pnpm --filter web exec tsc -b --force` exit 0,
`pnpm lint --force` exit 0.
**Zero testów komponentów**, zgodnie z decyzją projektową.
**Wszystko niezastage'owane**, żadnego commita, żadnego pusha, żadnego branchu.

**Otwarte pytania do maintainera, zebrane z grup 4, 5 i 6**:
1. Umiejscowienie przycisków dodawania. Makieta stawia je w wierszu tytułu „Konfigurator", co
   wymagałoby wpuszczenia `packages/apps/web/src/routes/config.tsx` do zakresu.
2. Który przycisk jest głównym. Makiety przeczą sobie, dziś oba są `outline`.
3. Makieta szuflady pomija przycisk „Dodaj regały", który w aplikacji istnieje. Zostawiony,
   bo wiążącym kryterium jest parytet z dzisiejszą szufladą ścienną.
4. **Dostępność dwóch pasów gondoli.** „Strona 1" i „Strona 2" są dekoracyjne: nic nie wiąże ich
   z pasem dla czytnika ekranu, a oba pasy renderują identyczne przyciski, więc czytnik przeczyta
   każdy regał dwa razy bez informacji, że to jedna konfiguracja. Nic nie dodano, bo żadna makieta
   tego nie zamawia, a R15 zabrania wymyślania stringów. Wymaga osobnego kroku i decyzji o treści.

**Zgłoszone problemy poza zakresem, świadomie nienaprawione**:
- `createDefaultWallLayout` i `createDefaultGondolaLayout` wołane bezwarunkowo przy każdym renderze
  `OfferLayouts` (preegzystujące, krok 4.5 zabraniał naprawy tutaj).
- `NaN` w `numberOfLayouts` serializuje się do `null` w ciele autozapisu i serwer je odrzuca,
  dając toast o nieudanym zapisie.
- `toHaveLength` zbędne obok `toEqual` w dwóch plikach testowych domeny.
- `componentCatalogMock` nazywa się „mock", a jest fixture'em. Zmiana nazwy dotknęłaby każdego testu
  domeny i API.
- Sprawdzenie kształtu `"gondolaUnits" in layout` stoi w trzech miejscach. Helper dopiero przy
  czwartym konsumencie i tylko jako predykat kształtu, nigdy jako opakowanie `isLayoutGondola`.
