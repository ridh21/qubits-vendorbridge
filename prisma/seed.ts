import {
  PrismaClient,
  QuotationStatus,
  Role,
  RfqStatus,
  VendorStatus,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("demo1234", 10)

  // Wipe transactional data so seed is idempotent
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.invoiceLine.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.quotationLine.deleteMany(),
    prisma.quotation.deleteMany(),
    prisma.rfqVendor.deleteMany(),
    prisma.rfqAttachment.deleteMany(),
    prisma.rfqItem.deleteMany(),
    prisma.rfq.deleteMany(),
    prisma.codeSequence.deleteMany(),
  ])

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "admin@yopmail.com",
          "admin.vendorbridge@yopmail.com",
          "officer@yopmail.com",
          "officer.vendorbridge@yopmail.com",
          "officer2@yopmail.com",
          "officer2.vendorbridge@yopmail.com",
          "manager@yopmail.com",
          "manager.vendorbridge@yopmail.com",
          "manager2@yopmail.com",
          "manager2.vendorbridge@yopmail.com",
          "vendor@yopmail.com",
          "vendor.vendorbridge@yopmail.com",
        ],
      },
    },
  })

  // --- Users ---
  const users = [
    { email: "admin.vendorbridge@yopmail.com", name: "Ada Admin", role: Role.ADMIN },
    { email: "officer.vendorbridge@yopmail.com", name: "Olivia Officer", role: Role.PROCUREMENT_OFFICER },
    { email: "officer2.vendorbridge@yopmail.com", name: "Owen Officer", role: Role.PROCUREMENT_OFFICER },
    { email: "manager.vendorbridge@yopmail.com", name: "Marcus Manager", role: Role.MANAGER },
    { email: "manager2.vendorbridge@yopmail.com", name: "Maya Manager", role: Role.MANAGER },
  ] as const

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash: password, disabled: false },
      create: { ...u, passwordHash: password },
    })
  }

  // --- Vendors ---
  const vendorSeeds = [
    { name: "Acme Steel Co.", category: "Logistics", gst: "27AAACA1234A1Z5", contact: "Anil Kumar", email: "vendor.vendorbridge@yopmail.com", phone: "+91 98765 43210", address: "12 Industrial Estate, Mumbai", rating: 4.4 },
    { name: "Stellar IT Services", category: "IT", gst: "29BBBCS5678B1Z2", contact: "Sunita Patel", email: "stellar.vendorbridge@yopmail.com", phone: "+91 99887 76543", address: "Tower B, Bangalore", rating: 4.1 },
    { name: "Office Mart", category: "Office Supplies", gst: "07CCDOM9012C1Z9", contact: "Ravi Sharma", email: "officemart.vendorbridge@yopmail.com", phone: "+91 91234 55678", address: "Block A, Delhi", rating: 3.9 },
    { name: "Nimbus Logistics", category: "Logistics", gst: "24DDDNL3456D1Z6", contact: "Pooja Singh", email: "nimbus.vendorbridge@yopmail.com", phone: "+91 98112 33445", address: "Hub 7, Ahmedabad", rating: 4.6 },
    { name: "Crestline Manufacturing", category: "Manufacturing", gst: "33EEECM7890E1Z3", contact: "Rajesh Iyer", email: "crestline.vendorbridge@yopmail.com", phone: "+91 90909 11122", address: "Plot 14, Chennai", rating: 4.2 },
  ]

  const vendors: { id: string; name: string; email: string }[] = []
  for (const v of vendorSeeds) {
    const vendor = await prisma.vendor.upsert({
      where: { gstNumber: v.gst },
      update: {
        name: v.name,
        category: v.category,
        contactName: v.contact,
        contactEmail: v.email,
        contactPhone: v.phone,
        address: v.address,
        rating: v.rating,
        status: VendorStatus.ACTIVE,
      },
      create: {
        name: v.name,
        category: v.category,
        gstNumber: v.gst,
        contactName: v.contact,
        contactEmail: v.email,
        contactPhone: v.phone,
        address: v.address,
        rating: v.rating,
        status: VendorStatus.ACTIVE,
      },
    })
    vendors.push({ id: vendor.id, name: vendor.name, email: vendor.contactEmail })
  }

  // Vendor user linked to first vendor
  await prisma.user.upsert({
    where: { email: "vendor.vendorbridge@yopmail.com" },
    update: {
      name: "Vivek Vendor",
      role: Role.VENDOR,
      vendorId: vendors[0].id,
      passwordHash: password,
      disabled: false,
    },
    create: {
      email: "vendor.vendorbridge@yopmail.com",
      name: "Vivek Vendor",
      role: Role.VENDOR,
      vendorId: vendors[0].id,
      passwordHash: password,
    },
  })

  const officer = await prisma.user.findUniqueOrThrow({
    where: { email: "officer.vendorbridge@yopmail.com" },
  })
  const manager = await prisma.user.findUniqueOrThrow({
    where: { email: "manager.vendorbridge@yopmail.com" },
  })

  // --- RFQs ---
  type ItemSpec = { name: string; qty: number; unit: string }
  const rfqSpecs: {
    code: string
    title: string
    description: string
    daysAhead: number
    status: RfqStatus
    items: ItemSpec[]
    vendorIdxs: number[]
    quotes: { vendorIdx: number; unitPrices: number[]; deliveryDays: number; status: QuotationStatus }[]
  }[] = [
    {
      code: "RFQ-2026-0001",
      title: "Q1 Office Stationery",
      description: "Bulk stationery for all branches.",
      daysAhead: -2,
      status: RfqStatus.AWARDED,
      items: [
        { name: "A4 Paper Ream", qty: 200, unit: "ream" },
        { name: "Ballpoint Pens", qty: 1000, unit: "pcs" },
      ],
      vendorIdxs: [2, 4],
      quotes: [
        { vendorIdx: 2, unitPrices: [22000, 1500], deliveryDays: 7, status: QuotationStatus.AWARDED },
        { vendorIdx: 4, unitPrices: [25000, 1700], deliveryDays: 10, status: QuotationStatus.REJECTED },
      ],
    },
    {
      code: "RFQ-2026-0002",
      title: "Annual IT Hardware Refresh",
      description: "Laptops + accessories for engineering team.",
      daysAhead: 8,
      status: RfqStatus.OPEN,
      items: [
        { name: "Engineering Laptop", qty: 25, unit: "pcs" },
        { name: "USB-C Dock", qty: 25, unit: "pcs" },
      ],
      vendorIdxs: [1, 4],
      quotes: [
        { vendorIdx: 1, unitPrices: [8500000, 850000], deliveryDays: 14, status: QuotationStatus.SUBMITTED },
        { vendorIdx: 4, unitPrices: [9200000, 800000], deliveryDays: 21, status: QuotationStatus.SUBMITTED },
      ],
    },
    {
      code: "RFQ-2026-0003",
      title: "Last-Mile Logistics Contract",
      description: "Quarterly logistics partner for warehouse → store.",
      daysAhead: 4,
      status: RfqStatus.OPEN,
      items: [
        { name: "Pan-India Delivery Tariff", qty: 1, unit: "contract" },
      ],
      vendorIdxs: [0, 3],
      quotes: [
        { vendorIdx: 0, unitPrices: [12500000], deliveryDays: 5, status: QuotationStatus.SHORTLISTED },
        { vendorIdx: 3, unitPrices: [11800000], deliveryDays: 4, status: QuotationStatus.SUBMITTED },
      ],
    },
    {
      code: "RFQ-2026-0004",
      title: "Custom Steel Brackets",
      description: "10,000 brackets per spec; quarterly draw.",
      daysAhead: 12,
      status: RfqStatus.OPEN,
      items: [
        { name: "Bracket Type-A", qty: 10000, unit: "pcs" },
      ],
      vendorIdxs: [0, 4],
      quotes: [],
    },
  ]

  let rfqCounter = 1
  let qtCounter = 1
  for (const spec of rfqSpecs) {
    const deadline = new Date(Date.now() + spec.daysAhead * 86_400_000)
    const rfqCode = `RFQ-${new Date().getFullYear()}-${String(rfqCounter++).padStart(4, "0")}`
    const rfq = await prisma.rfq.create({
      data: {
        code: rfqCode,
        title: spec.title,
        description: spec.description,
        deadline,
        status: spec.status,
        createdById: officer.id,
        items: {
          create: spec.items.map((it, idx) => ({
            name: it.name,
            quantity: it.qty,
            unit: it.unit,
            position: idx,
          })),
        },
        vendors: {
          create: spec.vendorIdxs.map((vi) => ({ vendorId: vendors[vi].id })),
        },
      },
      include: { items: { orderBy: { position: "asc" } } },
    })

    for (const quote of spec.quotes) {
      const code = `QT-${new Date().getFullYear()}-${String(qtCounter++).padStart(4, "0")}`
      const linesData = rfq.items.map((it, i) => {
        const unit = quote.unitPrices[i] ?? 0
        return {
          rfqItemId: it.id,
          unitPrice: unit,
          quantity: it.quantity,
          lineTotal: unit * it.quantity,
        }
      })
      const total = linesData.reduce((s, l) => s + l.lineTotal, 0)
      const quotation = await prisma.quotation.create({
        data: {
          code,
          rfqId: rfq.id,
          vendorId: vendors[quote.vendorIdx].id,
          deliveryDays: quote.deliveryDays,
          totalAmount: total,
          status: quote.status,
          submittedAt: new Date(),
          lines: { create: linesData },
        },
      })
      // Mark invitation as responded
      await prisma.rfqVendor.update({
        where: { rfqId_vendorId: { rfqId: rfq.id, vendorId: quotation.vendorId } },
        data: { status: "RESPONDED" },
      })

      // Approvals + PO + Invoice for AWARDED
      if (quote.status === QuotationStatus.AWARDED) {
        await prisma.approval.create({
          data: {
            quotationId: quotation.id,
            status: "APPROVED",
            remarks: "Lowest viable price; vendor delivery on track.",
            approverId: manager.id,
            decidedAt: new Date(),
          },
        })
        const taxRate = 18
        const taxAmount = Math.round((total * taxRate) / 100)
        const grandTotal = total + taxAmount
        const poCode = `PO-${new Date().getFullYear()}-${String(rfqCounter - 1).padStart(4, "0")}`
        const po = await prisma.purchaseOrder.create({
          data: {
            code: poCode,
            quotationId: quotation.id,
            vendorId: quotation.vendorId,
            totalAmount: total,
            taxAmount,
            grandTotal,
            status: "ISSUED",
          },
        })
        const invCode = `INV-${new Date().getFullYear()}-${String(rfqCounter - 1).padStart(4, "0")}`
        await prisma.invoice.create({
          data: {
            code: invCode,
            poId: po.id,
            vendorId: po.vendorId,
            subtotal: total,
            taxRate,
            taxAmount,
            grandTotal,
            status: "SENT",
            sentAt: new Date(),
            recipientEmail: vendors[quote.vendorIdx].email,
            lines: {
              create: linesData.map((l, idx) => ({
                name: rfq.items[idx].name,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                lineTotal: l.lineTotal,
              })),
            },
          },
        })
      }

      if (quote.status === QuotationStatus.SHORTLISTED) {
        await prisma.approval.create({
          data: {
            quotationId: quotation.id,
            status: "PENDING",
          },
        })
      }
    }
  }

  // Code sequences so future creation continues from here
  await prisma.codeSequence.upsert({
    where: { prefix: `RFQ-${new Date().getFullYear()}` },
    create: { prefix: `RFQ-${new Date().getFullYear()}`, year: new Date().getFullYear(), value: rfqCounter - 1 },
    update: { value: rfqCounter - 1 },
  })
  await prisma.codeSequence.upsert({
    where: { prefix: `QT-${new Date().getFullYear()}` },
    create: { prefix: `QT-${new Date().getFullYear()}`, year: new Date().getFullYear(), value: qtCounter - 1 },
    update: { value: qtCounter - 1 },
  })
  await prisma.codeSequence.upsert({
    where: { prefix: `PO-${new Date().getFullYear()}` },
    create: { prefix: `PO-${new Date().getFullYear()}`, year: new Date().getFullYear(), value: rfqCounter - 1 },
    update: { value: rfqCounter - 1 },
  })
  await prisma.codeSequence.upsert({
    where: { prefix: `INV-${new Date().getFullYear()}` },
    create: { prefix: `INV-${new Date().getFullYear()}`, year: new Date().getFullYear(), value: rfqCounter - 1 },
    update: { value: rfqCounter - 1 },
  })

  console.log("\n✅ Seed complete.")
  console.log("Demo users (password: demo1234):")
  console.log("  admin.vendorbridge@yopmail.com     · Admin")
  console.log("  officer.vendorbridge@yopmail.com   · Procurement Officer")
  console.log("  manager.vendorbridge@yopmail.com   · Manager / Approver")
  console.log("  vendor.vendorbridge@yopmail.com    · Vendor (linked to Acme Steel Co.)")
  console.log(`Vendors: ${vendors.length}`)
  console.log(`RFQs: ${rfqSpecs.length}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
