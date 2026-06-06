export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns?: Array<keyof T>,
) {
  if (rows.length === 0) return ""
  const cols = (columns ?? (Object.keys(rows[0]) as Array<keyof T>)) as Array<keyof T>
  const header = cols.map(String).join(",")
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r[c]
          if (v == null) return ""
          const s = String(v).replace(/"/g, '""')
          return /[",\n]/.test(s) ? `"${s}"` : s
        })
        .join(","),
    )
    .join("\n")
  return `${header}\n${body}`
}

export function downloadCsv(filename: string, csv: string) {
  if (typeof window === "undefined") return
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
