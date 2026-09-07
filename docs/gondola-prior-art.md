# Prior art: gondole we wcześniejszych kalkulatorach

## TL;DR

`gondolaUnits` to **strony gondoli**, nie segmenty wzdłuż ciągu. Obie wcześniejsze implementacje
zgadzają się co do tego niezależnie. Wersja pierwsza, jedyna która realnie wyceniała gondole na
produkcji, **dzieliła nogi na pół między strony** (`0.5 *` na stronę), czego dzisiejszy
`calculateGondolaLayoutDemand` nie robi: to rozbieżność cenowa wobec zachowania, które u klienta
działało. „Rozłącz gondolę" też już istniało, jako kłódka trzymająca obie strony w symetrii.

## Key Decisions

- Materiał z `projektownia-kalkulator` (v1) i `next-kalkulator` (v2) zapisany w katalogu zadania,
  bo rozstrzyga pytania, których dzisiejszy kod nie rozstrzyga.
- v1 jest autorytetem w kwestii ilości i wyceny, v2 w kwestii geometrii rysunku i szczytów.
- `remix-kalkulator` (v3) gondole usunął całkowicie i nie wnosi nic poza stylem walidacji.

## Open Questions / Risks

- Dzielenie nóg między strony: v1 liczyło pół nogi na stronę, dzisiejszy kod liczy pełną.
  Własny test repo (`calculateGondolaLayoutDemand.test.ts`) utrwala wersję bez dzielenia.
  Do rozstrzygnięcia przez maintainera, bo to decyzja fizyczna i cenowa, nie programistyczna.
- `numberOfGondolaUnits` nie ma odpowiednika w prior art. W obu wersjach liczba stron była
  strukturalnie równa dwa. Nazwa zaprasza do błędnego odczytu „segmenty".
- Reguła „półka nie głębsza niż baza" nie istniała nigdy. To nowe wymaganie klienta, nie regresja.
- Szczyt istniał tylko w v2, jako osobny rodzaj grupy. Wciśnięcie go do `gondolaUnits` pogłębi
  dwuznaczność stron kontra segmentów.

---

## Gdzie czego szukać

| Repo                           | Gondole                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `projektownia-kalkulator` (v1) | pełna implementacja i wycena, Formik + Chakra + Firestore            |
| `next-kalkulator` (v2)         | drugi model, ze szczytami, Zod + RHF + shadcn + Prisma, nieukończony |
| `remix-kalkulator` (v3)        | usunięte, model płaski bez stron                                     |
| `masterplan*`, `bubu-vanilla`  | brak, jedyne trafienie to nazwa koloru w CSS                         |

## v1: model, który wyceniał u klienta

```ts
export type FormSubCollectionType = {
  depth: string
  hasBaseCover: boolean
  stands: FormStandType[]
}

export type FormCollectionType = {
  height: string
  isCollapsed?: boolean
  // flag to edit both sub collections at once or separately
  isEditLocked?: boolean
  variant: CollectionOption // "P" | "G" | "I"
  numberOfCollections: number
  otherItems: FormOtherType[]
  subCollections: FormSubCollectionType[]
}
```

`subCollections` to zawsze `Array(2)`, również dla ciągu przyściennego, gdzie druga strona jest po
prostu nieczytana (`variant === "P" ? [subCollections[0]] : subCollections`). Konwersja przyścienny
na dwustronny była więc bezstratna, w przeciwieństwie do dzisiejszych dwóch rozłącznych schematów.

Podział odpowiedzialności, identyczny z dzisiejszym:

| Poziom                   | Pola                                                  | Znaczenie                  |
| ------------------------ | ----------------------------------------------------- | -------------------------- |
| ciąg                     | `height`, `variant`, `numberOfCollections`            | wspólne dla obu stron      |
| strona (`subCollection`) | `depth`, `hasBaseCover`                               | głębokość jest per strona  |
| segment (`stand`)        | `width`, `numberOfStands`, `backVariant`, `shelves[]` | szerokość jest per segment |

## v1: dzielenie nóg, czyli rozbieżność cenowa

`src/utils/order/orderLegs.ts`:

```ts
const number = sumBy("numberOfStands", stands) + 1
return [
  {
    // share profiles in gondola and impulse collections between sides
    number: variant === "P" ? number : 0.5 * number,
    price: number * profile.price,
  },
]
```

Połówki sumowane po stronach, potem `Math.ceil` w agregacie. Stopy (`orderFeet.ts`) **nie** były
dzielone: każda strona dostaje własne `sumBy("numberOfStands", stands) + 1`. Asymetria celowa i
fizyczna: jedna wspólna kolumna nóg, dwa niezależne komplety stóp.

Dzisiejszy `calculateGondolaLayoutDemand` woła `calculateWallLayoutDemand` per strona bez dzielenia.
Własny test repo utrwala `{ id: "leg-130-8-3", quantity: 8 }` dla trzech regałów i dwóch stron,
czyli `(3+1)*2`. Reguła v1 dałaby `4`.

Uwaga: v1 miało tu własny błąd, `price` liczone z niepodzielonego `number`, więc cena nóg gondoli
była podwójna wobec ilości. Tego nie przenosić.

## v1: „rozłącz gondolę" jako kłódka

`src/components/SubForms/FormSubCollection.tsx`:

```tsx
useEffect(() => {
  if (isEditLocked) {
    setValues({
      ...values,
      collections: values.collections.map((collection, index) =>
        index === collectionIndex
          ? { ...collection, subCollections: Array(2).fill(subCollection) }
          : collection,
      ),
    })
  }
}, [subCollection])
```

Semantyka warta powtórzenia:

- Domyślnie **zamknięta** (commit `7855b3f` „initial locked mode" przestawił to z `false`). To jest
  zakodowane „90% gondol jest symetrycznych".
- Przy zamkniętej kłódce każda kontrolka strony drugiej jest `isDisabled`, ale nadal widoczna, więc
  użytkownik cały czas widzi obie strony.
- Otwarcie kłódki niczego nie przebudowuje, tylko przestaje kopiować. **Rozłączenie to flaga, nie
  migracja danych**, i jest odwracalne.

## v1: szczyt, plecy, osłony

- **Szczyt**: nie istniał.
- **Podwójne plecy**: `backVariant` o wartościach `"0" | "1" | "2"`, użyte jako mnożnik w
  `orderBacks.ts`. Dla gondoli opcja `"2"` była **ukrywana**, bo dwie strony i tak dają dwa
  komplety pleców, więc „podwójne" liczyłoby potrójnie.
- **Osłona dolna**: `hasBaseCover`, boolean **per strona**, kategoria produktowa „Osłony dolne".
- **Osłona górna**: tylko jako pozycja z katalogu „inne", dokładnie w roli dzisiejszych `extras`.

## v2: geometria i szczyty

```ts
export const groupSchema = z.object({
  foot: z.number(),
  stands: z.array(standSchema),
  variant: z.enum(["peak", "side", "side-gondola"]),
})
```

Gondola to **cztery grupy: strona, strona, szczyt, szczyt**:

```ts
if (variant === "G") {
  return [...Array(2).fill(groupSideGondola), ...Array(2).fill(groupPeak)]
}
```

Rysunek to widok z góry, siatka CSS ustawia strony jako dwa poziome pasy w środkowej kolumnie, a
szczyty obrócone o 90 stopni na końcach, domykając prostokąt. Skala `1.6 * foot` na wysokość i
`1.6 * width` na szerokość, czyli ta sama stała, którą dziś ma `WallLayoutPlan`.

Dwie reguły stamtąd warte zachowania: szczytu nie da się poszerzyć (przycisk dodania regału jest
`disabled` dla `variant === 'peak'`), a usunięcie szczytu robiło się przez skasowanie jego jedynego
regału, po czym pusta grupa renderowała placeholder z plusem jako sposób na powrót.

Zastrzeżenie: `'side-gondola'` w v2 jest deklarowane, ale **nigdzie nieczytane**. v2 nigdy nie
zaimplementowało dzielenia nóg i liczy je podwójnie względem v1. **v2 nie jest autorytetem w
kwestii ilości.**

## v2: opis ciągu

```ts
const collectionVariants = {
  P: "przyściennych",
  G: "dwustronnych",
  I: "impulsów",
}
```

Identyczne słownictwo jak dziś w `buildLayoutDescription`. Obie wersje czytają **tylko stronę
zerową**, więc opis zakłada symetrię. Przy rozłączonych stronach opis był błędny wtedy i jest
błędny dziś.

## Walidacja głębokości półek

Nie istniała w żadnej wersji. W v1 zmiana głębokości bazy **nadpisywała głębokość wszystkich półek**
na tej stronie, po czym użytkownik mógł je ręcznie zmienić w dowolną stronę, także głębiej niż baza.
Opcje półek filtrowane były wyłącznie po szerokości. Wymaganie klienta jest więc nowe i trzeba
zdecydować, czy zmniejszenie bazy przycina półki (styl v1, destrukcyjnie), czy blokuje.
