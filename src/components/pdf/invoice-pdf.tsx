import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

import { fromPaise } from "@/lib/money"

export type InvoicePdfProps = {
  code: string
  issuedAt: string
  status: string
  poCode: string
  rfqTitle: string
  subtotal: number
  taxRate: number
  taxAmount: number
  grandTotal: number
  vendor: {
    name: string
    email: string
    phone?: string
    address?: string
    gst?: string
  }
  lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[]
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 18, fontWeight: 700, color: "#111827" },
  small: { fontSize: 9, color: "#6b7280" },
  block: { marginBottom: 16 },
  blockTitle: { fontSize: 9, color: "#6b7280", textTransform: "uppercase", marginBottom: 4 },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  table: { marginTop: 8, borderTop: "1pt solid #e5e7eb", borderBottom: "1pt solid #e5e7eb" },
  trh: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: 6,
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  tr: {
    flexDirection: "row",
    padding: 6,
    borderTop: "1pt solid #f3f4f6",
  },
  cName: { flex: 4 },
  cQty: { flex: 1, textAlign: "right" },
  cUnit: { flex: 2, textAlign: "right" },
  cTotal: { flex: 2, textAlign: "right" },
  totals: { marginTop: 12, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", marginBottom: 2 },
  totalLabel: { width: 100, textAlign: "right", marginRight: 8, color: "#6b7280" },
  totalValue: { width: 120, textAlign: "right" },
  grand: { fontSize: 13, fontWeight: 700, marginTop: 6 },
  footer: { marginTop: 32, fontSize: 9, color: "#6b7280" },
})

function inr(paise: number) {
  return `INR ${fromPaise(paise).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function InvoicePdf(props: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>VendorBridge</Text>
            <Text style={styles.small}>Procurement & Vendor Management ERP</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>INVOICE</Text>
            <Text style={styles.small}>{props.code}</Text>
            <Text style={styles.small}>
              {new Date(props.issuedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.small}>Status: {props.status}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.col, styles.block]}>
            <Text style={styles.blockTitle}>Bill to</Text>
            <Text style={{ fontWeight: 700 }}>{props.vendor.name}</Text>
            <Text>{props.vendor.email}</Text>
            {props.vendor.phone && <Text>{props.vendor.phone}</Text>}
            {props.vendor.address && (
              <Text style={styles.small}>{props.vendor.address}</Text>
            )}
            {props.vendor.gst && (
              <Text style={styles.small}>GST: {props.vendor.gst}</Text>
            )}
          </View>
          <View style={[styles.col, styles.block]}>
            <Text style={styles.blockTitle}>Reference</Text>
            <Text>PO: {props.poCode}</Text>
            <Text>RFQ: {props.rfqTitle}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.trh}>
            <Text style={styles.cName}>Item</Text>
            <Text style={styles.cQty}>Qty</Text>
            <Text style={styles.cUnit}>Unit price</Text>
            <Text style={styles.cTotal}>Line total</Text>
          </View>
          {props.lines.map((l, i) => (
            <View key={i} style={styles.tr}>
              <Text style={styles.cName}>{l.name}</Text>
              <Text style={styles.cQty}>{l.quantity}</Text>
              <Text style={styles.cUnit}>{inr(l.unitPrice)}</Text>
              <Text style={styles.cTotal}>{inr(l.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{inr(props.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Tax ({props.taxRate.toFixed(2)}%)
            </Text>
            <Text style={styles.totalValue}>{inr(props.taxAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grand]}>
            <Text style={styles.totalLabel}>Grand total</Text>
            <Text style={styles.totalValue}>{inr(props.grandTotal)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your business. Generated by VendorBridge.
        </Text>
      </Page>
    </Document>
  )
}
