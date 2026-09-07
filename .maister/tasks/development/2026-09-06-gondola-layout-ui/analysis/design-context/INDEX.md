# Inwentarz makiet

Makiety wygenerowane w Fazie 4 przez `maister:mockup-studio`, w formacie HTML, wiązane do
istniejących tokenów i prymitywów projektu (patrz `design-resources.md`).

| ID | Typ | Źródło | Opis |
|----|-----|--------|------|
| screen:dodawanie-ciagu | screen | analysis/design-context/mockups/dodawanie-ci-gu-dwa-warianty.html | Dwa warianty dodawania ciągu: dwa przyciski obok siebie kontra jeden przycisk otwierający wybór typu. Rozstrzyga decyzję I1. |
| screen:gondola-na-planie | screen | analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html | Dwa warianty rysunku gondoli w widoku z góry: dwa pasy plecami do siebie kontra jeden pas o podwójnej głębokości. Rozstrzyga decyzję I3. |
| screen:konfigurator-z-gondola | screen | analysis/design-context/mockups/konfigurator-z-gondol.html | Pełna strona konfiguratora z ciągiem przyściennym i gondolą obok siebie, z nagłówkami, opisami z domeny i cenami. |
| screen:szuflada-edycji-gondoli | screen | analysis/design-context/mockups/szuflada-edycji-gondoli.html | Prawa szuflada edycji dla gondoli, z sekcjami Ciąg, Regały, Półki i Inne elementy ciągu oraz notą, że zmiany dotyczą obu stron. |
| component:layout-plan-header | component | analysis/design-context/mockups/konfigurator-z-gondol.html | Wspólny nagłówek ciągu: numer w `Badge`, opis z domeny, pole „Liczba ciągów", cena, powielanie i usuwanie. Kandydat na wyciągnięcie z `WallLayoutPlan.tsx`. |
| component:plan-unit | component | analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html | Prostokąt regału w skali 1.6 px na cm, z podpisem szerokość/głębokość/wysokość, klikalny, otwiera szufladę. |
| component:type-picker | component | analysis/design-context/mockups/dodawanie-ci-gu-dwa-warianty.html | Wybór typu ciągu, w wariancie B oparty na nieużywanym dziś `core/ui/radio-group.tsx`. |
| component:both-sides-note | component | analysis/design-context/mockups/szuflada-edycji-gondoli.html | Nota „Zmiany dotyczą obu stron gondoli", jedyny element komunikujący symetrię w tej iteracji. |
