/**
 * Multi-Provider Real Telecom SMS Gateway Dispatcher for Indian Mobile Numbers.
 * Supports:
 * 1. Fast2SMS (Direct Indian DLT / Quick OTP Gateway)
 * 2. 2Factor.in (Specialized Indian OTP Gateway)
 * 3. Twilio SMS
 */

export interface SmsSendResult {
  sent: boolean;
  provider: 'FAST2SMS' | '2FACTOR' | 'TWILIO' | 'DEV_FALLBACK';
  messageId?: string;
  error?: string;
}

export async function sendRealTelecomSms(params: {
  phone: string;
  otp: string;
}): Promise<SmsSendResult> {
  const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
  const otp = params.otp;
  const messageText = `Your Vyomi Fitness Club verification code is: ${otp}. Valid for 5 minutes. Please do not share this code.`;
  let lastError = '';

  // 1. Try Fast2SMS (Indian SMS Gateway)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && fast2SmsKey.trim().length > 10) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: cleanPhone,
        }),
      });

      const resData = await response.json();
      if (resData.return === true || resData.status_code === 200) {
        console.log(`[SMS:Fast2SMS] Successfully dispatched OTP to +91 ${cleanPhone}`);
        return { sent: true, provider: 'FAST2SMS', messageId: resData.request_id };
      } else {
        lastError = String(resData.message || 'Fast2SMS rejected the request');
        console.warn(`[SMS:Fast2SMS Error] ${resData.message || JSON.stringify(resData)}`);
      }
    } catch (e: any) {
      lastError = 'Could not reach Fast2SMS';
      console.warn(`[SMS:Fast2SMS Exception]`, e.message);
    }
  }

  // 2. Try 2Factor.in (Indian OTP Gateway)
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorKey && twoFactorKey.trim().length > 5) {
    try {
      const url = `https://2factor.in/v3/${twoFactorKey.trim()}/SMS/${cleanPhone}/${otp}/VyomiFitness`;
      const response = await fetch(url);
      const resData = await response.json();
      if (resData.Status === 'Success') {
        console.log(`[SMS:2Factor] Successfully dispatched OTP to +91 ${cleanPhone}`);
        return { sent: true, provider: '2FACTOR', messageId: resData.Details };
      }
    } catch (e: any) {
      console.warn(`[SMS:2Factor Exception]`, e.message);
    }
  }

  // 3. Try Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams({
        To: `+91${cleanPhone}`,
        From: twilioFrom,
        Body: messageText,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const resData = await response.json();
      if (response.ok && resData.sid) {
        console.log(`[SMS:Twilio] Successfully dispatched OTP to +91 ${cleanPhone}`);
        return { sent: true, provider: 'TWILIO', messageId: resData.sid };
      } else {
        console.warn(`[SMS:Twilio Error] ${resData.message}`);
      }
    } catch (e: any) {
      console.warn(`[SMS:Twilio Exception]`, e.message);
    }
  }

  // 4. Developer / Sandbox Fallback when no telecom API key is provided
  console.log(`[SMS:DEV] No live telecom gateway key in .env.local (FAST2SMS_API_KEY / TWILIO_ACCOUNT_SID). OTP for +91 ${cleanPhone}: ${otp}`);
  return {
    sent: false,
    provider: 'DEV_FALLBACK',
    error: lastError || 'TELECOM_KEY_REQUIRED',
  };
}
