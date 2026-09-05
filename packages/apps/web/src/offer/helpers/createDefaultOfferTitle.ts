const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
})

export function createDefaultOfferTitle(now = new Date()): string {
  return `Kalkulacja ${dateFormatter.format(now)} ${timeFormatter.format(now)}`
}
