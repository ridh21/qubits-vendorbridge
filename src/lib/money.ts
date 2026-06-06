// Money stored in paise/cents to avoid float drift.

/** GST rate applied across quotations, POs, and invoices. */
export const DEFAULT_TAX_RATE = 18

export function toPaise(rupees: number | string) {
  const n = typeof rupees === "string" ? parseFloat(rupees) : rupees
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

export function fromPaise(paise: number) {
  return paise / 100
}

export function formatCurrency(paise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(fromPaise(paise))
}

export type LineLike = { unitPrice: number; quantity: number }

export function computeLineTotal(line: LineLike) {
  return Math.round(line.unitPrice * line.quantity)
}

export function computeTotals(
  lines: LineLike[],
  taxRatePercent: number,
): { subtotal: number; taxAmount: number; grandTotal: number } {
  const subtotal = lines.reduce((sum, l) => sum + computeLineTotal(l), 0)
  const taxAmount = Math.round((subtotal * taxRatePercent) / 100)
  return { subtotal, taxAmount, grandTotal: subtotal + taxAmount }
}
