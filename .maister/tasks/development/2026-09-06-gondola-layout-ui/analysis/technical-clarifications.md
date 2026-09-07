# Ustalenia techniczne z Fazy 5

## TL;DR

Dwie decyzje techniczne. Nogi **zostają** w `calculateWallLayoutDemand`, która dostaje opcjonalny
zasięg ich liczenia, domyślnie równy `numberOfLayouts`: ściana nie podaje nic i jej wynik jest
nietknięty, gondola podaje `sufit(n / 2) * numberOfLayouts`. Sposób poszerzenia typu formularza
**oddany specyfikacji**, która wybrała zwinięcie do `OfferInput`.

## Key Decisions

- **Przekazać zasięg nóg do kalkulacji ściennej zamiast wydzielać liczenie nóg.** Ścieżki ściennej
  nie da się w ten sposób ruszyć, nie powstaje nowy plik w domenie, a `calculateLegDemand` już
  wyraża tę regułę przez swój `numberOfLayouts`.
- **Poprzednia odpowiedź, o wydzieleniu nóg, została wycofana po audycie** jako wewnętrznie
  sprzeczna. Szczegóły poniżej, w T2.
- **Poszerzenie typu formularza rozstrzygnęła specyfikacja**: zwinięcie do `OfferInput`.

## Open Questions / Risks

- Ochrona ścieżki ściennej opiera się teraz na wartości domyślnej parametru, a nie na dyscyplinie.
  Ruszona asercja w teście ściennym znaczy, że wywołanie ścienne zaczęło podawać zasięg, którego
  podawać nie powinno.
- Kontekst przekazywany do kalkulacji ściennej z gondoli ma **dwie różne liczby**: `numberOfLayouts`
  nadal zwielokrotnione przez liczbę stron, żeby stopy pozostały pełne na każdą stronę, oraz zasięg
  nóg zawężony przez `sufit(n / 2)`. Pomylenie ich daje ciche przekłamanie wyceny.

---

## Pytania i odpowiedzi

### T1. Jak poszerzyć typ formularza

**Odpowiedź: niech rozstrzygnie specyfikacja.**

Dwa warianty przekazane subagentowi:

**Wariant A, zwinięcie do `OfferInput`.** Po poszerzeniu `WallOfferInput` staje się tożsamy
z `OfferInput`, więc `offer.types.ts` może zniknąć, a rzutowanie `offer.input as WallOfferInput`
w `OfferFormProvider.tsx:37` przestaje być potrzebne, co usuwa istniejący błąd. Ścieżki pól gondoli
same wchodzą do `FieldPathByValue`, więc `OptionStepper` i `CountStepper` nie wymagają zmian.
Koszt: `useWatch` na całym layoucie zwraca unię i każdy konsument musi zawężać.

**Wariant B, dwa zawężone typy per wariant.** `WallOfferInput` zostaje, dochodzi
`GondolaOfferInput`, oba rzutowane z jednego kontekstu formularza. Komponenty mają węższy typ
i mniej zawężeń wewnątrz, ale rzutowanie zostaje, tylko rozdwojone, a `.maister/docs/standards/
global/coding-style.md` nazywa rzutowanie zamiast zawężania błędem.

Subagent ma wybrać jeden i uzasadnić wybór w specyfikacji.

### T2. Jak zaimplementować dzielenie nóg

**Odpowiedź, po korekcie: przekazać zasięg nóg do kalkulacji ściennej.**

`calculateWallLayoutDemand` przyjmuje opcjonalny zasięg liczenia nóg, domyślnie równy
`numberOfLayouts`. Ciąg przyścienny nie podaje nic, więc jego wynik i kolejność listy pozostają
nietknięte. `calculateGondolaLayoutDemand` podaje `sufit(numberOfGondolaUnits / 2) *
numberOfLayouts`, co daje jedną kolumnę nóg na parę stron.

**Poprzednia odpowiedź była błędna i została wycofana.** Brzmiała: „wydzielić liczenie nóg
z kalkulacji ściennej". Audyt specyfikacji wykazał, że jest wewnętrznie sprzeczna, bo
`calculateWallLayoutDemand` **jest** ścieżką ścienną, a jej własny test asercjonuje
`{ id: "leg-130-8-3", quantity: 12 }` jako dziesiąty element listy porównywanej przez `toEqual`.
Wyprowadzenie nóg z tej funkcji rusza tę asercję, więc obietnica „wynik ścieżki ściennej pozostaje
identyczny co do treści i kolejności" nie mogła być jednocześnie spełniona.

Audyt wykazał też, że przesłanka, na której odrzuciłem wariant z mnożnikiem, była fałszywa.
Twierdziłem, że wprowadza ułamek do funkcji operującej na liczbach całkowitych. Nie wprowadza:
`sufit(n / 2)` jest zawsze całkowity, a `calculateLegDemand` ma już sygnaturę wyrażającą tę regułę
wprost, przez `numberOfLayouts`. Kupowałem refaktoryzację pliku, na którym stoi cała działająca
wycena, argumentem, który nie obowiązywał.

Dodatkowo odrzucone: liczenie nóg w orkiestracji gondoli z odejmowaniem nadmiaru, jako logika
dwuetapowa i trudniejsza do przeczytania.
