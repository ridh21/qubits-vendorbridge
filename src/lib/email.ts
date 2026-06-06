import path from "path"
import nodemailer from "nodemailer"
import type Mail from "nodemailer/lib/mailer"

import { getAppUrl } from "@/lib/app-url"

const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com"
const smtpPort = Number(process.env.SMTP_PORT ?? "587")
const smtpUser = process.env.SMTP_USER
const smtpPassword = process.env.SMTP_PASSWORD
const from = process.env.EMAIL_FROM ?? smtpUser ?? "VendorBridge <noreply@vendorbridge.dev>"

// Use the compressed, email-sized PNG (~7 KB) so transactional mail
// stays well under per-recipient size limits.
const LOGO_PATH = path.join(process.cwd(), "public", "logo-email.png")
const LOGO_CID = "vendorbridge-logo"

const BRAND_BLUE = "#1F88C9"
const BRAND_NAVY = "#0D2A41"
const BRAND_NAVY_SOFT = "#11365B"
const MUTED = "#64748b"
const BORDER = "#e2e8f0"
const SOFT_BG = "#f8fafc"

const transporter =
  smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : null

if (transporter) {
  console.log(`[email] Configured: ${smtpUser} via ${smtpHost}:${smtpPort}`)
} else {
  console.warn(
    `[email] SMTP_USER / SMTP_PASSWORD missing — emails will be logged to console only`,
  )
}

function logDevEmail(subject: string, body: string) {
  console.warn(
    `[email] (dry-run, SMTP not configured)\n  Subject: ${subject}\n  Body: ${body}`,
  )
}

type Attachment = NonNullable<Mail.Options["attachments"]>[number]

async function send(opts: {
  to: string
  subject: string
  html: string
  attachments?: Attachment[]
}) {
  if (!transporter) {
    logDevEmail(opts.subject, opts.html.replace(/<[^>]+>/g, " ").slice(0, 200))
    return null
  }
  const logoAttachment: Attachment = {
    filename: "logo.png",
    path: LOGO_PATH,
    cid: LOGO_CID,
  }
  try {
    const result = await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: [logoAttachment, ...(opts.attachments ?? [])],
    })
    console.log(
      `[email] sent to=${opts.to} subject="${opts.subject}" id=${result.messageId}`,
    )
    return result
  } catch (err) {
    console.error(
      `[email] FAILED to=${opts.to} subject="${opts.subject}":`,
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    )
    throw err
  }
}

function shell(opts: {
  preheader: string
  heading: string
  intro?: string
  bodyHtml: string
  ctaLabel?: string
  ctaHref?: string
  footerNote?: string
}) {
  const appUrl = getAppUrl()
  const cta = opts.ctaLabel && opts.ctaHref
    ? `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="border-radius: 8px; background: ${BRAND_BLUE};">
              <a href="${opts.ctaHref}" target="_blank" style="display:inline-block; padding: 12px 22px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px; font-family: -apple-system, Segoe UI, Roboto, sans-serif;">
                ${opts.ctaLabel}
              </a>
            </td>
          </tr>
        </table>`
    : ""

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VendorBridge</title>
</head>
<body style="margin:0; padding:0; background:${SOFT_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:${BRAND_NAVY};">
  <div style="display:none; max-height:0; overflow:hidden; color:transparent;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SOFT_BG}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow: 0 1px 2px rgba(13,42,65,0.04), 0 8px 24px rgba(13,42,65,0.06);">
            <tr>
              <td style="background:#ffffff; padding: 24px 32px; border-bottom: 1px solid ${BORDER};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="vertical-align:middle;">
                      <img src="cid:${LOGO_CID}" alt="VendorBridge" width="48" height="32" style="display:inline-block; vertical-align:middle;" />
                      <span style="display:inline-block; vertical-align:middle; margin-left:12px; color:${BRAND_NAVY}; font-size:17px; font-weight:700; letter-spacing:0.2px;">VendorBridge</span>
                    </td>
                    <td align="right" valign="middle" style="vertical-align:middle; color:${MUTED}; font-size:11px; text-transform:uppercase; letter-spacing:1px;">
                      Procurement ERP
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:4px; background: linear-gradient(90deg, ${BRAND_NAVY} 0%, ${BRAND_BLUE} 100%); line-height:4px; font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <h1 style="margin:0 0 12px; font-size:22px; color:${BRAND_NAVY}; font-weight:700; line-height:1.3;">${opts.heading}</h1>
                ${opts.intro ? `<p style="margin:0 0 16px; font-size:14px; line-height:1.6; color:${BRAND_NAVY};">${opts.intro}</p>` : ""}
                ${opts.bodyHtml}
                ${cta}
                ${opts.footerNote ? `<p style="margin: 18px 0 0; font-size:12px; color:${MUTED}; line-height:1.6;">${opts.footerNote}</p>` : ""}
              </td>
            </tr>
            <tr>
              <td style="background:${SOFT_BG}; padding: 20px 32px; border-top: 1px solid ${BORDER}; font-size: 11px; color:${MUTED}; text-align:center; line-height:1.6;">
                Sent by <strong style="color:${BRAND_NAVY};">VendorBridge</strong> · Procurement & Vendor Management ERP<br />
                <a href="${appUrl}" style="color:${BRAND_BLUE}; text-decoration:none;">${appUrl}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  link: string,
) {
  const subject = "Reset your VendorBridge password"
  const html = shell({
    preheader: "Click the button to reset your VendorBridge password",
    heading: `Hi ${name},`,
    intro:
      "We received a request to reset the password for your VendorBridge account. Click the button below to choose a new one.",
    bodyHtml: `
      <p style="margin: 0 0 8px; font-size:14px; color:${BRAND_NAVY};">This link expires in <strong>30 minutes</strong>.</p>
      <p style="margin: 0; font-size:12px; color:${MUTED};">Or paste this URL into your browser:<br /><span style="word-break:break-all; color:${BRAND_BLUE};">${link}</span></p>`,
    ctaLabel: "Reset password",
    ctaHref: link,
    footerNote:
      "If you didn’t request this, you can safely ignore this email — your password won’t change.",
  })
  return send({ to, subject, html })
}

export async function sendUserCredentialsEmail(opts: {
  to: string
  name: string
  password: string
  loginUrl?: string
}) {
  const subject = "Your VendorBridge login credentials"
  const loginUrl = opts.loginUrl ?? `${getAppUrl()}/login`
  const html = shell({
    preheader: "Your VendorBridge account is ready",
    heading: `Welcome, ${opts.name}.`,
    intro: "Your VendorBridge account has been created. Use the credentials below to log in.",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SOFT_BG}; border:1px solid ${BORDER}; border-radius:10px; padding: 16px;">
        <tr>
          <td style="font-size:11px; color:${MUTED}; text-transform:uppercase; letter-spacing:0.6px;">Email</td>
        </tr>
        <tr>
          <td style="font-size:14px; color:${BRAND_NAVY}; padding-bottom: 12px;"><strong>${opts.to}</strong></td>
        </tr>
        <tr>
          <td style="font-size:11px; color:${MUTED}; text-transform:uppercase; letter-spacing:0.6px;">Temporary password</td>
        </tr>
        <tr>
          <td style="font-size:14px; color:${BRAND_NAVY}; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;"><strong>${opts.password}</strong></td>
        </tr>
      </table>`,
    ctaLabel: "Sign in",
    ctaHref: loginUrl,
    footerNote:
      "For security, change this password after your first login.",
  })
  return send({ to: opts.to, subject, html })
}

export async function sendInvoiceEmail(opts: {
  to: string
  invoiceCode: string
  vendorName: string
  message?: string
  pdf: Uint8Array
  amount?: string
  poCode?: string
}) {
  const subject = `Invoice ${opts.invoiceCode} from VendorBridge`
  const html = shell({
    preheader: `Invoice ${opts.invoiceCode} attached`,
    heading: `Invoice ${opts.invoiceCode}`,
    intro: `Hi ${opts.vendorName}, please find your invoice from VendorBridge attached as a PDF.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SOFT_BG}; border-left: 3px solid ${BRAND_BLUE}; border-radius:8px; padding: 14px 16px;">
        <tr>
          <td style="font-size:11px; color:${MUTED}; text-transform:uppercase; letter-spacing:0.6px;">Invoice</td>
          <td align="right" style="font-size:11px; color:${MUTED}; text-transform:uppercase; letter-spacing:0.6px;">${opts.poCode ? "Purchase Order" : ""}</td>
        </tr>
        <tr>
          <td style="font-size:14px; color:${BRAND_NAVY};"><strong>${opts.invoiceCode}</strong></td>
          <td align="right" style="font-size:14px; color:${BRAND_NAVY};">${opts.poCode ?? ""}</td>
        </tr>
        ${
          opts.amount
            ? `<tr><td colspan="2" style="padding-top:10px; font-size:11px; color:${MUTED}; text-transform:uppercase; letter-spacing:0.6px;">Grand total</td></tr>
               <tr><td colspan="2" style="font-size:18px; color:${BRAND_NAVY}; font-weight:700;">${opts.amount}</td></tr>`
            : ""
        }
      </table>
      ${
        opts.message
          ? `<p style="margin: 16px 0 0; font-size:14px; color:${BRAND_NAVY}; line-height:1.6;">${opts.message}</p>`
          : ""
      }`,
    footerNote:
      "The full invoice with line items and tax breakdown is attached as a PDF.",
  })
  return send({
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
