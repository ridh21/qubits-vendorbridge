import path from "path"
import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

import { fromPaise } from "@/lib/money"

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png")

const BRAND_BLUE = "#1F88C9"
const BRAND_NAVY = "#0D2A41"
const MUTED = "#64748b"
const BORDER = "#e2e8f0"
const SOFT_BG = "#f8fafc"

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
  page: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: BRAND_NAVY,
  },
  brandBar: {
    height: 6,
    backgroundColor: BRAND_BLUE,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 18,
    borderBottom: `1pt solid ${BORDER}`,
  },
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 56, height: 36, objectFit: "contain" },
  brandText: { marginLeft: 10 },
  brandName: { fontSize: 16, fontWeight: 700, color: BRAND_NAVY },
  brandTagline: { fontSize: 8, color: MUTED, marginTop: 2 },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: BRAND_BLUE,
    letterSpacing: 1,
  },
  invoiceCode: {
    fontSize: 11,
    fontWeight: 700,
    color: BRAND_NAVY,
    marginTop: 2,
  },
  metaLine: { fontSize: 9, color: MUTED, marginTop: 2 },
  statusPill: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: SOFT_BG,
    borderRadius: 10,
    fontSize: 8,
    color: BRAND_NAVY,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  body: { paddingHorizontal: 40, paddingTop: 22 },
  row: { flexDirection: "row", gap: 16 },
  block: {
    flex: 1,
    backgroundColor: SOFT_BG,
    padding: 12,
    borderRadius: 6,
    borderLeft: `3pt solid ${BRAND_BLUE}`,
  },
  blockTitle: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
    fontWeight: 700,
  },
  blockMain: { fontWeight: 700, fontSize: 11, color: BRAND_NAVY },
  blockLine: { fontSize: 9, marginTop: 2, color: BRAND_NAVY },
  blockMuted: { fontSize: 9, marginTop: 2, color: MUTED },

  section: { marginTop: 22 },
  sectionTitle: {
    fontSize: 9,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    fontWeight: 700,
  },

  table: { borderRadius: 6, overflow: "hidden", border: `1pt solid ${BORDER}` },
  trh: {
    flexDirection: "row",
    backgroundColor: BRAND_NAVY,
    padding: 8,
    fontSize: 9,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: 700,
  },
  tr: {
    flexDirection: "row",
    padding: 8,
    borderTop: `0.5pt solid ${BORDER}`,
    backgroundColor: "#ffffff",
  },
  trAlt: { backgroundColor: SOFT_BG },
  cName: { flex: 4 },
  cQty: { flex: 1, textAlign: "right" },
  cUnit: { flex: 2, textAlign: "right" },
  cTotal: { flex: 2, textAlign: "right" },

  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  totalsBox: { width: 240 },
  totalRow: { flexDirection: "row", paddingVertical: 3 },
  totalLabel: { flex: 1, textAlign: "right", marginRight: 10, color: MUTED },
  totalValue: { width: 110, textAlign: "right", color: BRAND_NAVY },
  grandRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    backgroundColor: BRAND_NAVY,
    borderRadius: 6,
  },
  grandLabel: {
    flex: 1,
    textAlign: "right",
    marginRight: 10,
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 11,
  },
  grandValue: {
    width: 110,
    textAlign: "right",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 13,
  },

  notes: {
    marginTop: 26,
    padding: 12,
    backgroundColor: SOFT_BG,
    borderRadius: 6,
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.5,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1pt solid ${BORDER}`,
    paddingTop: 8,
    fontSize: 8,
    color: MUTED,
  },
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
        <View style={styles.brandBar} fixed />

        <View style={styles.header}>
          <View style={styles.brandWrap}>
            <Image src={LOGO_PATH} style={styles.logo} />
            <View style={styles.brandText}>
              <Text style={styles.brandName}>VendorBridge</Text>
              <Text style={styles.brandTagline}>
                Procurement & Vendor Management ERP
              </Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceCode}>{props.code}</Text>
            <Text style={styles.metaLine}>
              {new Date(props.issuedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.statusPill}>{props.status}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Bill to</Text>
              <Text style={styles.blockMain}>{props.vendor.name}</Text>
              <Text style={styles.blockLine}>{props.vendor.email}</Text>
              {props.vendor.phone && (
                <Text style={styles.blockLine}>{props.vendor.phone}</Text>
              )}
              {props.vendor.address && (
                <Text style={styles.blockMuted}>{props.vendor.address}</Text>
              )}
              {props.vendor.gst && (
                <Text style={styles.blockMuted}>GST: {props.vendor.gst}</Text>
              )}
            </View>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Reference</Text>
              <Text style={styles.blockMain}>{props.poCode}</Text>
              <Text style={styles.blockMuted}>RFQ: {props.rfqTitle}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            <View style={styles.table}>
              <View style={styles.trh}>
                <Text style={styles.cName}>Description</Text>
                <Text style={styles.cQty}>Qty</Text>
                <Text style={styles.cUnit}>Unit price</Text>
                <Text style={styles.cTotal}>Line total</Text>
              </View>
              {props.lines.map((l, i) => (
                <View
                  key={i}
                  style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]}
                >
                  <Text style={styles.cName}>{l.name}</Text>
                  <Text style={styles.cQty}>{l.quantity}</Text>
                  <Text style={styles.cUnit}>{inr(l.unitPrice)}</Text>
                  <Text style={styles.cTotal}>{inr(l.lineTotal)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsBox}>
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
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>Grand total</Text>
                <Text style={styles.grandValue}>{inr(props.grandTotal)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.notes}>
            Thank you for partnering with us. Payment is due as per the agreed
            terms on the purchase order. For any billing queries, reply to this
            email or reach out to your procurement contact.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>VendorBridge — Procurement & Vendor Management</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
