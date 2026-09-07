# Uwagi końcowego klienta

## TL;DR

Lista wymagań od użytkownika końcowego kalkulatora, przekazana przez maintainera w trakcie Fazy 1.
Wiążące wejście dla całego workflow, nie tło rozmowy. Sekcja 5 (logika gondoli) dotyczy wprost tego
zadania i zmienia jego zakres: gondola jest bytem dwustronnym, nie pojedynczą stroną.
Pozostałe sekcje opisują szerszy dług konfiguratora i mają być weryfikowane na bieżąco, nie
realizowane w całości w tym zadaniu.

## Key Decisions

- Wymagania zapisane w katalogu zadania, żeby każda faza i każdy subagent widział je bez pytania
  maintainera ponownie.
- Treść zachowana dosłownie, w oryginalnym brzmieniu i numeracji, bez przeredagowania.

## Open Questions / Risks

- Sekcja 5 rozszerza zakres pilota poza "dodaj formularz gondoli": dotyka semantyki dwóch stron,
  szczytu, rozłączania i błędu usuwania regału.
- Sekcje 2, 3, 6 i 7 opisują braki i reguły, które dotyczą także ciągów przyściennych. Trzeba
  rozstrzygnąć, co wchodzi do tego zadania, a co zostaje osobnym.
- Punkt "Nigdy nie dajemy półek wiszących głębszych niż baza" to reguła domenowa bez odpowiednika
  w schemacie ani w walidacji.

---

## Treść oryginalna

### 1) Skróty / wygoda obsługi (UX)

Menu pod prawym przyciskiem myszy na grafikach/elementach
np. szybkie akcje: dodaj/usuń regał, rozłącz gondolę, itp.

### 2) Braki w porównaniu do pierwszej wersji (funkcje krytyczne)

- Brak możliwości dodawania ilości ciągów
- Brak zwijania grafik
- Brak podsumowania całości oferty
- Brak możliwości powielania już zbudowanego ciągu
- Brak zapisu
- Po przejściu do rozpiski lub produktów wszystko w formularzu się zeruje (reset danych)

### 3) Przyciskowe opcje do dodania / poprawy

- Przycisk „podwójne plecy”: wybór (0 / 1 / 2)
- Przycisk „osłona dolna”: (0 / 1)
- Przycisk „osłona górna”: (0 / 1)

### 4) Zmiana kolejności w „szufladzie” (panel narzędzi)

W sekcji regału: „regał dodaj/usuń” jako pierwszy (przenieść na górę listy)

### 5) Gondola – logika działania (bardzo ważne)

(bo ok. 90% gondol jest dwustronna + półki symetryczne)

- Dodawanie gondoli powinno dotyczyć całej gondoli (2 strony), nie pojedynczej strony
- Propozycja interakcji:
  - po prawym kliknięciu opcja: „Rozłącz gondolę” (na pojedyncze strony)
  - alternatywnie: podwójny klik zmienia zawartość/konfigurację
- Możliwość dodania gondoli bez szczytu
  - standardowo: ze szczytem
  - ale opcja: usuń szczyt
- Błąd usuwania: usunięcie regału usuwa ostatni regał, a nie zaznaczony element

### 6) Okno dodawania półek – poprawa czytelności

- Okno dodawania półek jest mało czytelne → do przeprojektowania
- Kolejność półek: od największej głębokości do najmniejszej
- Układ w jednej linii, np.: (-) (37) (+) (kosz)
  (czyli: zmniejsz / wartość / zwiększ / kosz)

### 7) Zasady projektowe

Nigdy nie dajemy półek wiszących głębszych niż baza
→ dodać blokadę / ostrzeżenie (walidacja)

### 8) Informacja na dole ekranu

Na dole stały opis: „to jest rozpiska ciągu” (informacja kontekstowa)
