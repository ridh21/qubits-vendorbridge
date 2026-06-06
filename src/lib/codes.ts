import { prisma } from "@/lib/prisma"

/**
 * Generates the next sequential code for the given prefix in the current year.
 * Format: PREFIX-YYYY-NNNN (e.g. RFQ-2026-0001).
 */
export async function nextCode(prefix: "RFQ" | "QT" | "PO" | "INV") {
  const year = new Date().getFullYear()
  const key = `${prefix}-${year}`

  const seq = await prisma.codeSequence.upsert({
    where: { prefix: key },
    create: { prefix: key, year, value: 1 },
    update: { value: { increment: 1 } },
  })

  return `${prefix}-${year}-${String(seq.value).padStart(4, "0")}`
}
