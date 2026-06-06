export type CompareRow = {
  itemId: string
  itemName: string
  quantity: number
  unit: string
  /** vendorId -> { unitPrice, lineTotal } */
  cells: Record<string, { unitPrice: number; lineTotal: number }>
  /** vendorId with lowest unitPrice for this row */
  lowestVendorId: string | null
}

export type CompareSummary = {
  vendorId: string
  total: number
  deliveryDays: number
  rating: number
  quotationId: string
  quotationCode: string
  status: string
}

export function buildComparison(
  items: { id: string; name: string; quantity: number; unit: string }[],
  quotations: {
    id: string
    code: string
    vendorId: string
    deliveryDays: number
    totalAmount: number
    status: string
    vendor: { name: string; rating: number }
    lines: { rfqItemId: string; unitPrice: number; quantity: number }[]
  }[],
) {
  const rows: CompareRow[] = items.map((it) => {
    const cells: CompareRow["cells"] = {}
    let lowestVendorId: string | null = null
    let lowest = Number.POSITIVE_INFINITY
    for (const q of quotations) {
      const line = q.lines.find((l) => l.rfqItemId === it.id)
      const unitPrice = line?.unitPrice ?? 0
      const lineTotal = unitPrice * (line?.quantity ?? it.quantity)
      cells[q.vendorId] = { unitPrice, lineTotal }
      if (unitPrice > 0 && unitPrice < lowest) {
        lowest = unitPrice
        lowestVendorId = q.vendorId
      }
    }
    return {
      itemId: it.id,
      itemName: it.name,
      quantity: it.quantity,
      unit: it.unit,
      cells,
      lowestVendorId,
    }
  })

  const summaries: CompareSummary[] = quotations.map((q) => ({
    vendorId: q.vendorId,
    total: q.totalAmount,
    deliveryDays: q.deliveryDays,
    rating: q.vendor.rating,
    quotationId: q.id,
    quotationCode: q.code,
    status: q.status,
  }))

  const lowestTotalVendorId =
    summaries.reduce<{ id: string | null; total: number }>(
      (acc, s) => (s.total > 0 && s.total < acc.total ? { id: s.vendorId, total: s.total } : acc),
      { id: null, total: Number.POSITIVE_INFINITY },
    ).id

  const fastestVendorId =
    summaries.reduce<{ id: string | null; days: number }>(
      (acc, s) =>
        s.deliveryDays > 0 && s.deliveryDays < acc.days
          ? { id: s.vendorId, days: s.deliveryDays }
          : acc,
      { id: null, days: Number.POSITIVE_INFINITY },
    ).id

  return { rows, summaries, lowestTotalVendorId, fastestVendorId }
}
