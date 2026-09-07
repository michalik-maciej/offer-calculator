# Ustalenia z Fazy 1

## TL;DR

Cztery pytania, cztery rozstrzygnięcia maintainera. Najważniejsze: gondola **dzieli nogi między
strony**, jak w wersji pierwszej kalkulatora, więc zadanie obejmuje też poprawkę domeny i jej testu,
a nie tylko interfejs. Obie strony konfiguruje się **zawsze razem**, bez możliwości rozdzielenia w
tej iteracji. Szczyt, podwójne plecy i osłony zostają poza zakresem. W interfejsie strona gondoli
nazywa się „Strona", schemat bez zmian.

## Key Decisions

- **Nogi dzielone między strony**, zgodnie z zachowaniem wersji pierwszej, która wyceniała u
  klienta. Wymaga zmiany w `calculateGondolaLayoutDemand` i w jego teście.
- **Obie strony konfigurowane razem.** Gondola to jedna konfiguracja stosowana do obu stron, czyli
  jeden wpis `gondolaUnits` z `numberOfGondolaUnits: 2`. Brak edycji stron osobno i brak akcji
  „rozłącz gondolę" w tej iteracji.
- **Zakres zawężony do gondoli**: dodanie, edycja, plan, wycena. Szczyt, podwójne plecy, osłona
  dolna i górna oraz walidacja głębokości półek to osobne zadania, każde wymaga nowych pól.
- **„Strona" jako nazwa w interfejsie**, `gondolaUnits` i `numberOfGondolaUnits` bez zmian w
  schemacie, żeby uniknąć migracji zapisanych ofert.

## Open Questions / Risks

- Schemat dopuszcza gondolę o rozjechanych stronach (kilka wpisów `gondolaUnits` z różnymi
  głębokościami i różnymi regałami), a ten interfejs nie potrafi jej wyrazić. Dziś takich ofert nie
  ma, bo gondoli nigdy nie dało się utworzyć, ale formularz musi zachować się sensownie, jeśli taka
  oferta kiedyś powstanie inną drogą.
- Asymetryczne gondole, czyli pozostałe około 10% przypadków z uwag klienta, zostają poza tą
  iteracją i wymagają osobnego zadania.
- Zmiana liczenia nóg dotyka wyceny. Zapisane oferty zawierające gondole nie istnieją, bo interfejs
  nigdy ich nie tworzył, więc nie ma czego migrować. Ale każda oferta wyliczona po tej zmianie da
  inny wynik niż ta sama oferta wyliczona przed nią.
- Nazwa `gondolaUnits` zostaje myląca w kodzie: sugeruje segmenty wzdłuż ciągu, a oznacza strony.
  Ryzyko przyszłego błędnego odczytu przyjęte świadomie, w zamian za brak migracji.

---

## Pytania i odpowiedzi

### 1. Czy gondola dzieli nogi między strony?

**Odpowiedź: dzielić, jak w v1.**

Kontekst: `projektownia-kalkulator` liczyło pół nogi na stronę (`variant === "P" ? number : 0.5 *
number`), sumowało po stronach i zaokrąglało w górę. Stopy nie były dzielone. Dzisiejszy
`calculateGondolaLayoutDemand` deleguje do `calculateWallLayoutDemand` per strona bez dzielenia, a
test w repo utrwala wynik 8 nóg tam, gdzie reguła v1 dałaby 4.

Konsekwencja: zadanie obejmuje zmianę w domenie i w teście. Przy okazji nie przenosimy błędu z v1,
gdzie cena nóg liczona była z niepodzielonej liczby.

### 2. Jak ma działać symetria stron i „rozłącz gondolę"?

**Odpowiedź: obie strony konfigurowane razem, bez możliwości rozdzielenia.**

Gondola jest edytowana jako jedna konfiguracja stosowana do obu stron: jeden wpis `gondolaUnits`
z `numberOfGondolaUnits: 2`, jedna głębokość, jeden zestaw regałów. W tej iteracji nie ma edycji
stron osobno ani akcji „rozłącz gondolę". Zgodne z uwagą klienta, że około 90% gondol jest
dwustronnych z symetrycznymi półkami.

Konsekwencja dla interfejsu: edytor nie potrzebuje nawigacji między stronami ani trzeciej
współrzędnej wyboru w szufladzie. Plan nadal rysuje dwie strony, bo tym gondola fizycznie jest,
ale obie z tej samej konfiguracji.

### 3. Ile z listy uwag klienta wchodzi do tego zadania?

**Odpowiedź: tylko gondola, czyli dodanie, edycja, plan i wycena.**

Poza zakresem tej iteracji, każde jako osobne zadanie: szczyt (punkt 5), podwójne plecy oraz osłona
dolna i górna (punkt 3), walidacja „półka nie głębsza niż baza" (punkt 7), menu pod prawym
przyciskiem (punkt 1), przeprojektowanie okna półek (punkt 6), kolejność w szufladzie (punkt 4),
stały opis na dole ekranu (punkt 8) oraz braki wymienione w punkcie 2.

### 4. Jak nazwać stronę gondoli w interfejsie?

**Odpowiedź: „Strona" w UI, schemat bez zmian.**

Interfejs mówi „Strona 1", „Strona 2". Pola `gondolaUnits` i `numberOfGondolaUnits` zostają.
W prior art polska nazwa tego poziomu nie istniała: v1 nazywało to technicznie `subCollection`,
v2 `group`.
