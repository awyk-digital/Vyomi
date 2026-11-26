import QRCode from 'qrcode';

export const DEFAULT_MERCHANT_UPI_VPA = process.env.NEXT_PUBLIC_MERCHANT_UPI_VPA || '9666636563@axisbank';
export const DEFAULT_MERCHANT_NAME = process.env.NEXT_PUBLIC_MERCHANT_NAME || 'VALLABHANENI';

/**
 * Generates an NPCI-compliant UPI payment intent string.
 *
 * Format:
 * upi://pay?pa=<VPA>&pn=<PayeeName>&am=<Amount>&cu=INR&tn=<TransactionNote>
 *
 * When scanned by PhonePe, Google Pay, Paytm, BHIM, CRED, etc.,
 * the app automatically reads the `am` parameter and pre-fills
 * the exact payable amount based on the selected membership plan.
 */
export function generateUpiString(params: {
  vpa?: string;
  payeeName?: string;
  amountInr: number;
  transactionNote: string;
  referenceId?: string;
}): string {
  const vpa = (params.vpa || DEFAULT_MERCHANT_UPI_VPA).trim();
  const payeeName = encodeURIComponent((params.payeeName || DEFAULT_MERCHANT_NAME).trim());
  const amount = params.amountInr.toFixed(2);
  const note = encodeURIComponent(params.transactionNote.trim());
  const ref = params.referenceId ? `&tr=${encodeURIComponent(params.referenceId)}` : '';

  return `upi://pay?pa=${vpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}${ref}`;
}

/**
 * Generates a high-resolution QR code Data URL (PNG) from a given string.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 360,
    margin: 2,
    color: {
      dark: '#18181B', // Deep obsidian
      light: '#FFFFFF', // Pure white
    },
    errorCorrectionLevel: 'M',
  });
}
