import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const VARIANTS: Record<string, string> = {
  // Vendor
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  INACTIVE: "bg-zinc-100 text-zinc-700 border-zinc-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  // RFQ / Quotation
  DRAFT: "bg-zinc-100 text-zinc-700 border-zinc-200",
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  CLOSED: "bg-zinc-200 text-zinc-700 border-zinc-300",
  AWARDED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  SHORTLISTED: "bg-violet-100 text-violet-800 border-violet-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  WITHDRAWN: "bg-zinc-100 text-zinc-700 border-zinc-200",
  INVITED: "bg-blue-50 text-blue-700 border-blue-200",
  RESPONDED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DECLINED: "bg-rose-100 text-rose-800 border-rose-200",
  // Approval
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  // PO
  ISSUED: "bg-blue-100 text-blue-800 border-blue-200",
  FULFILLED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  // Invoice
  SENT: "bg-blue-100 text-blue-800 border-blue-200",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OVERDUE: "bg-rose-100 text-rose-800 border-rose-200",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium uppercase tracking-wide text-[10px]",
        VARIANTS[status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200",
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  )
}
