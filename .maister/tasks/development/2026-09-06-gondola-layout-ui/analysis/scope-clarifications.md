# Rozstrzygnięcia zakresowe z Fazy 2

## TL;DR

Pięć decyzji z bramki: jedna krytyczna o regule liczenia nóg, cztery ważne. Reguła nóg to sufit
z liczby stron podzielonej przez dwa, więc dwie strony dzielą kolumnę, a wpis jednostronny dostaje
pełną. Dwie decyzje wizualne (sposób dodawania ciągu i rysunek gondoli) przesunięte do makiet w
Fazie 4. Dekompozycja komponentów oddana planowi implementacji. Gondola o rozjechanych stronach
świadomie nieobsługiwana.

## Key Decisions

- **Nogi: sufit(liczba stron / 2) razy (liczba regałów + 1) razy liczba ciągów, na wpis.** Dla
  gondoli dwustronnej daje jedną kolumnę, dla wpisu jednostronnego pełną. Rusza tylko test gondoli,
  z 8 na 4, i nie wypuszcza ułamków z orkiestracji.
- **Sposób dodawania ciągu rozstrzygną makiety.** Dwa przyciski kontra jeden z wyborem typu,
  decyzja na obrazku zamiast z opisu.
- **Rysunek gondoli rozstrzygną makiety.** Dwa pasy plecami do siebie kontra jeden pas o podwójnej
  głębokości.
- **Dekompozycję komponentów rozstrzygnie plan implementacji**, mając przed sobą gotową
  specyfikację i realny rozmiar obu wariantów.
- **Gondola o rozjechanych stronach nieobsługiwana.** Nie piszemy pod nią kodu.

## Open Questions / Risks

- Ułamki nie mogą opuścić orkiestracji: `calculateBomPrice` i `breakdownDemandByCategory` biorą
  listę zapotrzebowania surową i żadne z nich nie zaokrągla, więc pół nogi wyszłoby na Rozpiskę
  jako „0.5". Wybrana reguła tego unika z definicji, ale test musi to przypilnować.
- Dzielenia nóg nie da się już zrobić przez delegację: `calculateWallLayoutDemand` liczy plecy,
  bazy, półki, nogi i stopy w jednym wywołaniu, a nogi potrzebują teraz innego zasięgu niż
  pozostała czwórka. To jedyne miejsce, gdzie ścieżka ścienna jest narażona na regresję.
- Nieobsłużona gondola o rozjechanych stronach zachowa się jak dziś: wyrenderuje się jako pusty
  obramowany prostokąt z poprawnym opisem i poprawną ceną obok, a szuflada nigdy się nie otworzy,
  bo nie ma w co kliknąć. Wyceniona i pusta jednocześnie.

---

## Decyzja krytyczna

### C1. Reguła liczenia nóg dla kształtów spoza zakresu interfejsu

Dla kształtu, który ten interfejs tworzy, wszystkie rozważane reguły dają ten sam wynik: jedna
kolumna, czyli `(liczba regałów + 1) * liczba ciągów`. Różnica dotyczy wyłącznie kształtów, które
schemat dopuszcza, a UI nie zbuduje, i które siedzą w dwóch istniejących testach.

**Wybrano:** `sufit(numberOfGondolaUnits / 2) * (liczba regałów + 1) * numberOfLayouts` na wpis.

Odrzucono wariant dosłownie z v1 (pół kolumny na stronę, sumowane i zaokrąglane na końcu), bo
mówiłby, że ciąg jednostronny potrzebuje połowy kolumny, i ruszałby oba testy. Odrzucono też
rzucanie wyjątkiem na nieobsługiwanych kształtach, bo zamknęłoby drogę gondolom asymetrycznym
planowanym w kolejnej iteracji.

## Decyzje ważne

### I1. Sposób wyboru typu przy dodawaniu ciągu

**Odłożone do Fazy 4.** Makiety pokażą dwa przyciski obok siebie i wariant z jednym przyciskiem
otwierającym wybór. To jedyne wejście do gondoli w całej aplikacji, więc odkrywalność zależy
wyłącznie od tej kontrolki.

### I2. Jeden komponent czy dwa

**Odłożone do Fazy 7.** Po decyzji o wspólnej konfiguracji obu stron różnica w edytorze to jeden
segment ścieżki pola, więc osobny komponent byłby w dużej mierze kopią 363 linii. Plan implementacji
rozstrzygnie to na podstawie specyfikacji.

### I3. Geometria rysunku gondoli

**Odłożone do Fazy 4.** Prior art z drugiego kalkulatora rysował widok z góry: dwie strony jako dwa
pasy w środkowej kolumnie, szczyty obrócone o 90 stopni na końcach. Szczytów nie rysujemy, są poza
zakresem.

### I4. Zapisana gondola o rozjechanych stronach

**Nieobsługiwana.** Nie piszemy pod ten przypadek kodu. Dziś takich ofert nie ma i nie da się ich
utworzyć tym interfejsem.
