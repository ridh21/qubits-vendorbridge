import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com"
const smtpPort = Number(process.env.SMTP_PORT ?? "587")
const smtpUser = process.env.SMTP_USER
const smtpPassword = process.env.SMTP_PASSWORD
const from = process.env.EMAIL_FROM ?? smtpUser ?? "VendorBridge <noreply@vendorbridge.dev>"

const transporter =
  smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })
    : null

function logDevEmail(subject: string, body: string) {
  // In dev without SMTP credentials, just log so flows are still demoable.
  console.warn(
    `[email] SMTP credentials not set — would send:\n  Subject: ${subject}\n  Body: ${body}`,
  )
}

async function sendMail(message: Parameters<NonNullable<typeof transporter>["sendMail"]>[0]) {
  if (!transporter) {
    return null
  }

  return transporter.sendMail(message)
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  link: string,
) {
  const subject = "Reset your VendorBridge password"
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${link}" style="background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">
          Reset password
        </a>
      </p>
      <p>This link expires in 30 minutes.</p>
      <p style="color:#666;font-size:12px">If you didn't request this, you can ignore this email.</p>
    </div>
  `
  if (!transporter) {
    logDevEmail(subject, link)
    return
  }
  await sendMail({ from, to, subject, html })
}

export async function sendUserCredentialsEmail(opts: {
  to: string
  name: string
  password: string
  loginUrl?: string
}) {
  const subject = "Your VendorBridge login credentials"
  const loginUrl = opts.loginUrl ?? `${process.env.APP_URL ?? "http://localhost:3000"}/login`
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
      <h2>Hi ${opts.name},</h2>
      <p>Your VendorBridge account has been created.</p>
      <p>
        <strong>Login:</strong> <a href="${loginUrl}">${loginUrl}</a><br />
        <strong>Email:</strong> ${opts.to}<br />
        <strong>Password:</strong> <code>${opts.password}</code>
      </p>
      <p style="color:#666;font-size:12px">Please log in and change this password if needed.</p>
    </div>
  `

  if (!transporter) {
    logDevEmail(subject, `${loginUrl}\nEmail: ${opts.to}\nPassword: ${opts.password}`)
    return
  }

  await sendMail({ from, to: opts.to, subject, html })
}

export async function sendInvoiceEmail(opts: {
  to: string
  invoiceCode: string
  vendorName: string
  message?: string
  pdf: Uint8Array
}) {
  const subject = `Invoice ${opts.invoiceCode} from VendorBridge`
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
      <h2>Invoice ${opts.invoiceCode}</h2>
      <p>Hi ${opts.vendorName},</p>
      <p>${opts.message ?? "Please find your invoice attached."}</p>
      <p style="color:#666;font-size:12px">Sent via VendorBridge.</p>
    </div>
  `
  if (!transporter) {
    logDevEmail(subject, `[PDF attachment ${opts.pdf.byteLength} bytes]`)
    return
  }
  await sendMail({
    from,
    to: opts.to,
    subject,
    html,
    attachments: [
      {
        filename: `${opts.invoiceCode}.pdf`,
        content: Buffer.from(opts.pdf),
        contentType: "application/pdf",
      },
    ],
  })
}
