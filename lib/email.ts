import nodemailer from 'nodemailer';

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
}

export interface EmailSendResult {
  sent: boolean;
  provider: 'GMAIL_SMTP' | 'DEV_LOG';
  messageId?: string;
  error?: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER || 'sriharicherukumalli1@gmail.com';
  const pass = (process.env.GMAIL_APP_PASS || 'oapm mzzf iciw fwrb').replace(/\s+/g, '');

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
  const senderEmail = process.env.GMAIL_USER || 'sriharicherukumalli1@gmail.com';

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
                Hello <strong>${clientName}</strong>, thank you for enrolling at Vyomi Fitness Club. Use the 6-digit verification code below to verify your email and complete your membership registration:
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
export async function sendMembershipReceiptEmail(
  params: SendReceiptEmailParams
): Promise<EmailSendResult> {
  const senderEmail = process.env.GMAIL_USER || 'sriharicherukumalli1@gmail.com';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Membership Pass & Receipt - Vyomi Fitness Club</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #CBD5E1; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <!-- Top Gold Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #D97706, #FFB100); height: 6px;"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; text-align: center; border-bottom: 1px solid #F1F5F9;">
              <h1 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">
                VYOMI FITNESS CLUB
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 1.5px;">
                Elevate Your Fitness · Patamata, Vijayawada
              </p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FFFBEB; border-bottom: 1px solid #FEF3C7;">
              <h2 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #92400E;">
                Welcome to the Vyomi Community, ${params.clientName}!
              </h2>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #78350F;">
                Your enrollment for <strong>${params.packageName}</strong> is officially registered. Below is your Digital VIP Pass and membership particulars. Your official tax invoice and PDF receipt is attached.
              </p>
            </td>
          </tr>

          <!-- ================= DIGITAL VIP CARD EMBEDDED ================= -->
          <tr>
            <td style="padding: 28px 32px; background-color: #F1F5F9; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 440px; margin: 0 auto; background: linear-gradient(135deg, #18181B 0%, #0F0F11 50%, #080808 100%); border-radius: 16px; border: 1px solid rgba(212,175,55,0.4); box-shadow: 0 8px 24px rgba(0,0,0,0.3); overflow: hidden; color: #FFFFFF;">
                <!-- Card Top Row -->
                <tr>
                  <td style="padding: 20px 24px 12px 24px;">
                    <table width="100%">
                      <tr>
                        <td align="left">
                          <span style="display: block; font-size: 11px; font-weight: 800; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase;">VYOMI</span>
                          <span style="display: block; font-size: 8px; letter-spacing: 3px; color: rgba(255,255,255,0.6); text-transform: uppercase;">FITNESS CLUB</span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #D4AF37; background-color: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                            ${params.packageName.toUpperCase()} TIER
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card EMV Chip Row -->
                <tr>
                  <td style="padding: 4px 24px 16px 24px;" align="left">
                    <div style="width: 36px; height: 26px; background: linear-gradient(135deg, #F5D061, #D4AF37, #AA822A); border-radius: 4px; border: 1px solid #7A5610; display: inline-block;"></div>
                  </td>
                </tr>

                <!-- Card Member Info Bottom Row -->
                <tr>
                  <td style="padding: 16px 24px 20px 24px; border-top: 1px solid rgba(255,255,255,0.12);">
                    <table width="100%">
                      <tr>
                        <td align="left">
                          <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); margin-bottom: 2px;">MEMBER NAME</span>
                          <span style="display: block; font-size: 13px; font-weight: 800; color: #FFFFFF; font-family: monospace;">${params.clientName.toUpperCase()}</span>
                        </td>
                        <td align="right">
                          <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); margin-bottom: 2px;">UNIQUE MEMBER ID</span>
                          <span style="display: block; font-size: 13px; font-weight: 800; color: #D4AF37; font-family: monospace;">${params.memberCode}</span>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="padding-top: 10px;">
                          <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); margin-bottom: 2px;">PLAN VALIDITY</span>
                          <span style="display: block; font-size: 11px; font-weight: 700; color: #F1F5F9;">1 Year Full Access</span>
                        </td>
                        <td align="right" style="padding-top: 10px;">
                          <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); margin-bottom: 2px;">VALID THRU / PLAN END</span>
                          <span style="display: block; font-size: 11px; font-weight: 800; color: #F5D061; font-family: monospace;">${params.endDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 600; color: #475569;">
                Present this digital membership code at the front desk to claim your biometric wristband.
              </p>
            </td>
          </tr>

          <!-- Key Membership & Payment Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">
                Membership Particulars
              </h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600; width: 40%;">Member Code:</td>
                  <td style="color: #0F172A; font-weight: 800; font-family: monospace; font-size: 14px;">${params.memberCode}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Receipt Number:</td>
                  <td style="color: #0F172A; font-weight: 700;">${params.receiptNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Registration Ref:</td>
                  <td style="color: #0F172A; font-weight: 700;">${params.reference}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Membership Plan:</td>
                  <td style="color: #0F172A; font-weight: 700;">${params.packageName} (1 Year Access)</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Selected Time Slot:</td>
                  <td style="color: #0F172A; font-weight: 700;">${params.timeSlot}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Plan Start Date:</td>
                  <td style="color: #0F172A; font-weight: 600;">${params.startDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Plan End Date:</td>
                  <td style="color: #D97706; font-weight: 800; font-family: monospace;">${params.endDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Amount Invoiced:</td>
                  <td style="color: #0F172A; font-weight: 900; font-size: 16px;">₹${params.amountInr.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">Payment Mode:</td>
                  <td style="color: #0F172A; font-weight: 700;">${params.paymentMethod === 'CASH' ? 'Offline Cash (Front Desk)' : 'Online Payment (UPI QR: PhonePe/GPay)'}</td>
                </tr>
                ${params.utrNumber ? `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #475569; font-weight: 600;">UTR Transaction Ref:</td>
                  <td style="color: #0F172A; font-weight: 700; font-family: monospace;">${params.utrNumber}</td>
                </tr>` : ''}
                <tr>
                  <td style="color: #475569; font-weight: 600;">Payment Status:</td>
                  <td style="color: ${params.paymentStatus === 'PAID' ? '#059669' : '#D97706'}; font-weight: 800;">
                    ${params.paymentStatus === 'PAID' ? 'PAID & ACTIVATED' : 'PENDING CASH COLLECTION'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Location Info -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #475569; line-height: 1.6;">
              <p style="margin: 0 0 4px 0; font-weight: 800; color: #0F172A;">
                Vyomi Fitness Club
              </p>
              <p style="margin: 0;">
                4th Floor, Sonovision Durga Plaza, Benz Circle, Patamata, Vijayawada, AP 520010
              </p>
              <p style="margin: 4px 0 0 0;">
                Club Concierge: <strong>+91 99481 80333</strong> | UPI: <strong>9666636563@axisbank</strong>
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

    const attachments = params.pdfBase64
      ? [
          {
            filename: `Vyomi_Membership_Receipt_${params.receiptNumber}.pdf`,
            content: params.pdfBase64,
            encoding: 'base64',
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from: `"Vyomi Fitness Club" <${senderEmail}>`,
      to: params.toEmail,
      subject: `Official VIP Pass & Receipt [${params.memberCode}] - Vyomi Fitness Club`,
      html: htmlContent,
      attachments,
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
