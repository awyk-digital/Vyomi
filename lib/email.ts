import nodemailer from 'nodemailer';
import { RECEIPT_LOGO_JPEG } from './receiptLogo';
import { CLUB, GST_RATE } from './pdfReceipt';

/**
 * Official Email Dispatcher for Vyomi Fitness Club.
 * Powered directly by Google SMTP with App Password authentication.
 */

export interface SendReceiptEmailParams {
  toEmail: string;
  clientName: string;
  memberCode: string;
  receiptNumber: string;
  reference: string;
  packageName: string;
  amountInr: number;
  timeSlot: string;
  fitnessGoal?: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  paymentStatus: string;
  utrNumber?: string;
  pdfBase64?: string;
  /** List price of the plan, when a special price was given. */
  planPriceInr?: number;
}

export interface EmailSendResult {
  sent: boolean;
  provider: 'GMAIL_SMTP' | 'DEV_LOG';
  messageId?: string;
  error?: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER || '';
  const pass = (process.env.GMAIL_APP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send real-time 6-digit OTP verification email to customer's Gmail
 */
export async function sendGmailOtp({
  toEmail,
  otpCode,
  clientName = 'Valued Member',
}: {
  toEmail: string;
  otpCode: string;
  clientName?: string;
}): Promise<EmailSendResult> {
  const senderEmail = process.env.GMAIL_USER || '';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vyomi Fitness Club - Email Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #CBD5E1; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #D97706, #FFB100); height: 6px;"></td>
          </tr>
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 28px 28px 20px 28px; text-align: center; border-bottom: 1px solid #F1F5F9;">
              <h1 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">
                VYOMI FITNESS CLUB
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 1.5px;">
                Elevate Your Fitness · Patamata, Vijayawada
              </p>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 28px 32px; text-align: center;">
              <h2 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 800; color: #0F172A;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #334155;">
                Hello <strong>${clientName}</strong>, thank you for enrolling at Vyomi Fitness Club. Use the 6-digit verification code below to verify your email address (<strong>${toEmail}</strong>) and complete your membership registration:
              </p>

              <!-- OTP Code Display -->
              <div style="background-color: #FFFBEB; border: 2px dashed #D97706; border-radius: 12px; padding: 18px 24px; margin: 0 auto 24px auto; display: inline-block;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #92400E;">
                  ${otpCode}
                </span>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.<br/>
                If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #64748B;">
              <p style="margin: 0; font-weight: 600; color: #0F172A;">
                Vyomi Fitness Club Concierge
              </p>
              <p style="margin: 2px 0 0 0;">
                Sonovision Plaza, Benz Circle, Patamata, Vijayawada · +91 99481 80333
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[EMAIL:DEV] ✉️ GMAIL_USER / GMAIL_APP_PASS not configured in environment.`);
      console.log(`[EMAIL:DEV] 🔑 SIMULATED OTP CODE FOR ${toEmail}: 👉 [ ${otpCode} ] 👈`);
      return {
        sent: true,
        provider: 'DEV_LOG',
        messageId: `dev-otp-${Date.now()}`,
      };
    }

    const info = await transporter.sendMail({
      from: `"Vyomi Fitness Club" <${senderEmail}>`,
      to: toEmail,
      subject: `Your Vyomi Verification Code: ${otpCode}`,
      html: htmlContent,
    });

    console.log(`[EMAIL:OTP] Real-time OTP sent to ${toEmail} (ID: ${info.messageId})`);
    return {
      sent: true,
      provider: 'GMAIL_SMTP',
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`[EMAIL:OTP Error] Failed to send OTP to ${toEmail}:`, err);
    return {
      sent: false,
      provider: 'GMAIL_SMTP',
      error: err.message || 'Failed to dispatch email OTP',
    };
  }
}

/**
 * Send official membership receipt & digital VIP pass with unique code and end date
 */
const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const inr = (n: number) => `&#8377;${Math.round(n).toLocaleString('en-IN')}`;
function niceDate(v?: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || '');
  if (!m) return esc(v || '—');
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Send the membership receipt email: logo, member card, details, total.
 * The PDF receipt is attached; the logo is embedded inline (cid) so Gmail shows it.
 */
export function buildReceiptEmailHtml(params: SendReceiptEmailParams): string {
  const paid = params.paymentStatus === 'PAID';
  const total = Math.round(params.amountInr);
  const list = params.planPriceInr && params.planPriceInr > total ? Math.round(params.planPriceInr) : total;
  const discount = list - total;
  const gst = total - Math.round(total / (1 + GST_RATE));
  const firstName = esc(String(params.clientName || '').trim().split(/\s+/)[0] || 'there');
  const tier = esc(String(params.packageName || 'Member').replace(/\s*membership\s*/i, '').trim().toUpperCase() || 'MEMBER');
  const slot = esc(String(params.timeSlot || '').replace(/\s*\(.*\)\s*$/, ''));
  const method = String(params.paymentMethod || '').toUpperCase() === 'CASH' ? 'Cash at front desk' : 'UPI';

  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #EEF1F6;font-size:13px;color:#64748B;">${label}</td>
      <td align="right" style="padding:11px 0;border-bottom:1px solid #EEF1F6;font-size:14px;color:#0F172A;${strong ? 'font-weight:600;' : ''}">${value}</td>
    </tr>`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Vyomi membership receipt</title>
</head>
<body style="margin:0;padding:0;background:#0F2462;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F2462" style="background:#0F2462;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;">
        <tr><td bgcolor="#C9A03E" style="height:5px;line-height:5px;font-size:0;background:#C9A03E;">&nbsp;</td></tr>

        <!-- Logo -->
        <tr><td align="center" style="padding:28px 28px 6px;">
          <img src="cid:vyomi-logo" width="104" alt="Vyomi Fitness Club" style="display:block;width:104px;height:auto;border:0;">
        </td></tr>
        <tr><td align="center" style="padding:0 28px 22px;">
          <div style="font-size:11px;letter-spacing:3px;color:#C9A03E;font-weight:600;">ELEVATE YOUR FITNESS</div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:0 32px;">
          <h1 style="margin:0;font-size:22px;line-height:1.3;color:#112768;font-weight:700;">Welcome to Vyomi, ${firstName}.</h1>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#475569;">
            ${paid
              ? `Your <strong style="color:#0F172A;">${esc(params.packageName)}</strong> is active. Your receipt is attached as a PDF.`
              : `Your <strong style="color:#0F172A;">${esc(params.packageName)}</strong> is reserved. Please pay <strong style="color:#0F172A;">${inr(total)}</strong> in cash at the front desk to activate it. Your receipt is attached as a PDF.`}
          </p>
        </td></tr>

        <!-- Member card -->
        <tr><td style="padding:24px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1A3690" style="background:#1A3690;background-image:linear-gradient(135deg,#2A4FC4 0%,#1A3690 50%,#0F2462 100%);border-radius:16px;">
            <tr><td style="padding:20px 22px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:13px;letter-spacing:4px;color:#FFFFFF;font-weight:700;">VYOMI<div style="font-size:9px;letter-spacing:3px;color:#C7D4F5;font-weight:500;margin-top:3px;">FITNESS CLUB</div></td>
                <td align="right"><span style="display:inline-block;background:#E8C25A;color:#1A1405;font-size:10px;font-weight:700;letter-spacing:2px;padding:6px 12px;border-radius:999px;">${tier}</span></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:26px 22px 4px;">
              <div style="font-size:9px;letter-spacing:3px;color:#C7D4F5;">MEMBER</div>
              <div style="font-size:20px;letter-spacing:1px;color:#FFFFFF;font-weight:700;margin-top:4px;">${esc(String(params.clientName || '').trim().toUpperCase())}</div>
            </td></tr>
            <tr><td style="padding:12px 22px 0;"><div style="height:1px;line-height:1px;font-size:0;background:#C9A03E;">&nbsp;</div></td></tr>
            <tr><td style="padding:12px 22px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:9px;letter-spacing:2px;color:#C7D4F5;">MEMBER ID<div style="font-size:14px;letter-spacing:1px;color:#FFFFFF;margin-top:4px;font-family:Menlo,Consolas,monospace;">${esc(params.memberCode)}</div></td>
                <td align="right" style="font-size:9px;letter-spacing:2px;color:#C7D4F5;">VALID THRU<div style="font-size:14px;letter-spacing:1px;color:#E8C25A;margin-top:4px;">${niceDate(params.endDate)}</div></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:16px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Plan', esc(params.packageName), true)}
            ${row('Valid', `${niceDate(params.startDate)} – ${niceDate(params.endDate)}`)}
            ${slot ? row('Time slot', slot) : ''}
            ${discount > 0 ? row('Plan price', inr(list)) + row('Special price discount', `&minus; ${inr(discount)}`) : ''}
            ${row('GST @ 5% (included)', inr(gst))}
            ${row('Payment', method + (params.utrNumber ? ` · UTR ${esc(params.utrNumber)}` : ''))}
            ${row('Receipt no.', esc(params.receiptNumber))}
          </table>
        </td></tr>

        <!-- Total -->
        <tr><td style="padding:14px 32px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F2E2" style="background:#F8F2E2;border-left:4px solid #C9A03E;border-radius:10px;">
            <tr>
              <td style="padding:16px 18px;font-size:12px;letter-spacing:2px;font-weight:700;color:#0F172A;">${paid ? 'TOTAL PAID' : 'AMOUNT DUE AT FRONT DESK'}</td>
              <td align="right" style="padding:16px 18px;font-size:22px;font-weight:700;color:#112768;">${inr(total)}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px 26px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">Show your Member ID at the front desk to collect your access card. Questions? Just reply to this email.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td bgcolor="#F4F6FB" style="background:#F4F6FB;padding:20px 32px;text-align:center;border-top:1px solid #E3E8F2;">
          <div style="font-size:13px;font-weight:700;color:#112768;letter-spacing:1px;">VYOMI FITNESS CLUB</div>
          <div style="font-size:12px;line-height:1.7;color:#64748B;margin-top:4px;">
            ${esc(CLUB.address)}<br>
            <a href="tel:+919948180333" style="color:#1E3A8A;text-decoration:none;">${esc(CLUB.phone)}</a>
            &nbsp;·&nbsp; <a href="mailto:${CLUB.email}" style="color:#1E3A8A;text-decoration:none;">${CLUB.email}</a>
            &nbsp;·&nbsp; <a href="https://${CLUB.web}" style="color:#1E3A8A;text-decoration:none;">${CLUB.web}</a>
          </div>
        </td></tr>
        <tr><td bgcolor="#C9A03E" style="height:5px;line-height:5px;font-size:0;background:#C9A03E;">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return htmlContent;
}

export async function sendMembershipReceiptEmail(
  params: SendReceiptEmailParams
): Promise<EmailSendResult> {
  const senderEmail = process.env.GMAIL_USER || '';
  const paid = params.paymentStatus === 'PAID';
  const htmlContent = buildReceiptEmailHtml(params);

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[EMAIL:DEV] ✉️ GMAIL_USER / GMAIL_APP_PASS not configured. Simulated receipt for ${params.toEmail} (${params.receiptNumber})`);
      return {
        sent: true,
        provider: 'DEV_LOG',
        messageId: `dev-receipt-${Date.now()}`,
      };
    }

    const attachments: Array<Record<string, unknown>> = [
      {
        filename: 'vyomi-logo.jpg',
        content: RECEIPT_LOGO_JPEG.split(',')[1],
        encoding: 'base64',
        cid: 'vyomi-logo',
        contentDisposition: 'inline',
      },
    ];
    if (params.pdfBase64) {
      attachments.push({
        filename: `Vyomi_Receipt_${params.receiptNumber}.pdf`,
        content: params.pdfBase64,
        encoding: 'base64',
      });
    }

    const info = await transporter.sendMail({
      from: `"Vyomi Fitness Club" <${senderEmail}>`,
      to: params.toEmail,
      replyTo: CLUB.email,
      subject: `${paid ? 'Your Vyomi membership receipt' : 'Your Vyomi membership is reserved'} · ${params.memberCode}`,
      html: htmlContent,
      attachments: attachments as never,
    });

    console.log(`[EMAIL:Receipt] Successfully dispatched receipt ${params.receiptNumber} to ${params.toEmail} (ID: ${info.messageId})`);
    return {
      sent: true,
      provider: 'GMAIL_SMTP',
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`[EMAIL:Receipt Error] Failed to send receipt to ${params.toEmail}:`, err);
    return {
      sent: false,
      provider: 'GMAIL_SMTP',
      error: err.message || 'Failed to dispatch receipt email',
    };
  }
}
