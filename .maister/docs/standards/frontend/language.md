## Language and Formatting

### Every User-Facing String Is Polish

Labels, placeholders, button text, headings, legends, empty states, validation messages, toasts and
`aria-label`s are written in Polish, in every `.tsx` file under `packages/apps/web/src/`. This is a
product requirement, not a preference: the application has Polish-speaking users and no
localisation layer.

### English Stays Under the Surface

Identifiers, types, file names, comments, commit messages and log output are English. A
`console.error` is for the maintainer and stays English; the `toast.error` next to it is for the
user and is Polish.

### Numbers and Dates Through Intl, Locale pl-PL

Prices and dates are formatted with `Intl` formatters created once at module level with the `pl-PL`
locale, never inline in a render.

```ts
const priceFormatter = new Intl.NumberFormat("pl-PL", {
  currency: "PLN",
  maximumFractionDigits: 2,
  style: "currency",
})
```

### Polish Reaches the Domain Where It Describes the Product

Layout descriptions built in the domain (`buildLayoutDescription`) are Polish, because they are
product copy that happens to be assembled server-side. That is deliberate, and it is the one place
where domain output is not language-neutral.

### Category Labels Are Per-Feature Maps

Human-readable component category names live in per-feature label maps, because the grammatical form
differs by context: the offer breakdown needs plural and genitive forms, the inventory list needs the
singular. Two maps currently exist and should stay in sync when a category is added.
