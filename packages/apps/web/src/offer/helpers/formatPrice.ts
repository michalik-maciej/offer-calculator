const priceFormatter = new Intl.NumberFormat("pl-PL", {
  currency: "PLN",
  maximumFractionDigits: 2,
  style: "currency",
})

export const formatPrice = (value: number): string =>
  priceFormatter.format(value)
