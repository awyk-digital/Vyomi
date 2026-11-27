import { jsPDF } from 'jspdf';

/** Club details printed on every receipt and email. */
export const CLUB = {
  name: 'VYOMI FITNESS CLUB',
  tagline: 'ELEVATE YOUR FITNESS',
  address: '4th Floor, Durga Plaza, Patamata, Vijayawada',
  phone: '+91 99481 80333',
  email: 'vyomifitness@gmail.com',
  web: 'www.vyomifitness.in',
};

/** GST on memberships: 5%, included in the price. */
export const GST_RATE = 0.05;

/** One receipt number format everywhere: REG-20261127-0DLB -> REC-20261127-0DLB */
export function receiptNumberFor(reference: string): string {
  return `REC-${String(reference || '').replace(/^REG-/i, '')}`;
}

export interface ReceiptData {
  receiptNumber: string;
  reference: string;
  memberCode: string;
  clientName: string;
  phone: string;
  email: string;
  packageName: string;
  durationDays: number;
  timeSlot: string;
  fitnessGoal?: string;
  startDate: string;
  endDate: string;
  /** Amount actually charged (GST included). */
  amountInr: number;
  /** List price of the plan, when a special price was given. */
  planPriceInr?: number;
  paymentMethod: 'UPI' | 'CASH';
  paymentStatus: 'PAID' | 'PENDING_CASH_COLLECTION';
  utrNumber?: string;
  paymentDate: string;
  /** JPEG/PNG data URL of the logo on white. */
  logoDataUrl?: string;
}

// Brand colours (RGB)
const BLUE: [number, number, number] = [17, 39, 104]; // deep sapphire
const BLUE_2: [number, number, number] = [30, 58, 138];
const GOLD: [number, number, number] = [201, 160, 62];
const GOLD_SOFT: [number, number, number] = [248, 242, 226];
const INK: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [226, 232, 240];

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

function niceDate(v: string): string {
  if (!v) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return v;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function generatePdfReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297

  const fill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
  const draw = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);
  const color = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (style: 'normal' | 'bold', size: number) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };

  // ---------- Page: sapphire with gold sweeps ----------
  fill(BLUE);
  doc.rect(0, 0, W, H, 'F');
  fill(BLUE_2);
  doc.triangle(W, 0, W, 120, W - 120, 0, 'F');
  doc.triangle(0, H, 0, H - 120, 120, H, 'F');
  fill(GOLD);
  doc.triangle(W, 0, W, 34, W - 34, 0, 'F');
  doc.triangle(0, H, 0, H - 34, 34, H, 'F');

  // ---------- White bill sheet with gold frame ----------
  const X = 12;
  const Y = 12;
  const SW = W - 24;
  const SH = H - 24;
  fill([255, 255, 255]);
  doc.roundedRect(X, Y, SW, SH, 4, 4, 'F');
  draw(GOLD);
  doc.setLineWidth(0.5);
  doc.roundedRect(X + 3, Y + 3, SW - 6, SH - 6, 3, 3, 'S');

  const L = X + 11; // left content edge
  const R = X + SW - 11; // right content edge

  // ---------- Header ----------
  const logoW = 30;
  if (data.logoDataUrl) {
    try {
      doc.addImage(data.logoDataUrl, 'JPEG', L, Y + 10, logoW, logoW * 1.096);
    } catch {
      /* draw without logo */
    }
  }
  const tx = L + logoW + 6;
  font('bold', 15);
  color(BLUE);
  doc.text(CLUB.name, tx, Y + 19);
  font('bold', 7.5);
  color(GOLD);
  doc.text(CLUB.tagline, tx, Y + 24.5, { charSpace: 0.8 });
  font('normal', 8.5);
  color(MUTED);
  doc.text(CLUB.address, tx, Y + 31);
  doc.text(`${CLUB.phone}   ·   ${CLUB.email}`, tx, Y + 36);
  doc.text(CLUB.web, tx, Y + 41);

  // Receipt title block (right)
  font('bold', 20);
  color(BLUE);
  doc.text('RECEIPT', R, Y + 19, { align: 'right' });
  font('bold', 9);
  color(INK);
  doc.text(data.receiptNumber, R, Y + 27, { align: 'right' });
  font('normal', 8.5);
  color(MUTED);
  doc.text(`Date: ${niceDate(data.paymentDate)}`, R, Y + 32.5, { align: 'right' });

  // Status pill
  const paid = data.paymentStatus === 'PAID';
  const pill = paid ? 'PAID' : 'CASH DUE';
  font('bold', 8);
  const pw = doc.getTextWidth(pill) + 8;
  fill(paid ? BLUE_2 : GOLD);
  doc.roundedRect(R - pw, Y + 36, pw, 6.5, 3.2, 3.2, 'F');
  color(paid ? [255, 255, 255] : INK);
  doc.text(pill, R - pw / 2, Y + 40.5, { align: 'center' });

  // Gold rule
  let y = Y + 50;
  draw(GOLD);
  doc.setLineWidth(0.6);
  doc.line(L, y, R, y);

  // ---------- Billed to / Membership ----------
  y += 10;
  const colR = X + SW / 2 + 4;
  font('bold', 7.5);
  color(GOLD);
  doc.text('BILLED TO', L, y, { charSpace: 0.6 });
  doc.text('MEMBERSHIP', colR, y, { charSpace: 0.6 });

  const row = (x: number, yy: number, label: string, value: string, opts?: { strong?: boolean; blue?: boolean; maxW?: number }) => {
    font('normal', 8.5);
    color(MUTED);
    doc.text(label, x, yy);
    font(opts?.strong ? 'bold' : 'normal', 9.5);
    color(opts?.blue ? BLUE_2 : INK);
    const lines = doc.splitTextToSize(value || '—', opts?.maxW ?? 56) as string[];
    doc.text(lines[0] + (lines.length > 1 ? '…' : ''), x + 26, yy);
  };

  y += 8;
  row(L, y, 'Name', data.clientName, { strong: true });
  row(colR, y, 'Plan', data.packageName, { strong: true });
  y += 7;
  row(L, y, 'Member ID', data.memberCode, { strong: true, blue: true });
  row(colR, y, 'Duration', `${data.durationDays} days`);
  y += 7;
  row(L, y, 'Mobile', `+91 ${data.phone}`);
  row(colR, y, 'Time slot', (data.timeSlot || '').replace(/\s*\(.*\)\s*$/, ''));
  y += 7;
  row(L, y, 'Email', data.email);
  row(colR, y, 'Valid', `${niceDate(data.startDate)} – ${niceDate(data.endDate)}`);

  // ---------- Charges table ----------
  y += 14;
  fill(BLUE);
  doc.roundedRect(L, y, R - L, 10, 2, 2, 'F');
  font('bold', 8.5);
  color([255, 255, 255]);
  doc.text('DESCRIPTION', L + 5, y + 6.5, { charSpace: 0.4 });
  doc.text('AMOUNT', R - 5, y + 6.5, { align: 'right', charSpace: 0.4 });
  y += 10;

  const total = Math.round(data.amountInr);
  const list = data.planPriceInr && data.planPriceInr > 0 ? Math.round(data.planPriceInr) : total;
  const discount = list > total ? list - total : 0;
  const taxable = Math.round(total / (1 + GST_RATE));
  const gst = total - taxable;

  const line = (label: string, value: string, opts?: { sub?: string; color?: [number, number, number]; bold?: boolean }) => {
    y += 9;
    font(opts?.bold ? 'bold' : 'normal', 9.5);
    color(INK);
    doc.text(label, L + 5, y);
    color(opts?.color || INK);
    doc.text(value, R - 5, y, { align: 'right' });
    if (opts?.sub) {
      font('normal', 7.5);
      color(MUTED);
      doc.text(opts.sub, L + 5, y + 4.2);
      y += 3;
    }
    y += 2.5;
    draw(LINE);
    doc.setLineWidth(0.25);
    doc.line(L + 3, y, R - 3, y);
  };

  const term = data.durationDays === 365 ? '1 year' : `${data.durationDays} days`;
  line(`${data.packageName} — ${term}`, rs(list), { sub: `${data.durationDays} days · ${niceDate(data.startDate)} to ${niceDate(data.endDate)}` });
  if (discount > 0) line('Special price discount', `– ${rs(discount)}`, { color: BLUE_2 });

  // Tax summary (right aligned)
  y += 8;
  const sx = R - 70;
  font('normal', 9);
  color(MUTED);
  doc.text('Taxable value', sx, y);
  color(INK);
  doc.text(rs(taxable), R - 5, y, { align: 'right' });
  y += 6.5;
  color(MUTED);
  doc.text('GST @ 5% (included)', sx, y);
  color(INK);
  doc.text(rs(gst), R - 5, y, { align: 'right' });

  // Total band
  y += 7;
  fill(GOLD_SOFT);
  doc.roundedRect(L, y, R - L, 15, 2, 2, 'F');
  fill(GOLD);
  doc.rect(L, y, 1.6, 15, 'F');
  font('bold', 10);
  color(INK);
  doc.text(paid ? 'TOTAL PAID' : 'AMOUNT DUE AT FRONT DESK', L + 6, y + 9.5, { charSpace: 0.4 });
  font('bold', 16);
  color(BLUE);
  doc.text(rs(total), R - 5, y + 10, { align: 'right' });
  y += 15;

  // ---------- Payment ----------
  y += 12;
  font('bold', 7.5);
  color(GOLD);
  doc.text('PAYMENT', L, y, { charSpace: 0.6 });
  y += 8;
  row(L, y, 'Method', data.paymentMethod === 'UPI' ? 'UPI' : 'Cash at front desk');
  row(colR, y, 'Status', paid ? 'Paid' : 'Due at front desk', { strong: true, blue: paid });
  if (data.utrNumber) {
    y += 7;
    row(L, y, 'UTR / Ref.', data.utrNumber);
  }
  y += 7;
  row(L, y, 'Booking ref.', data.reference);

  // ---------- Footer ----------
  const fy = Y + SH - 30;
  draw(GOLD);
  doc.setLineWidth(0.4);
  doc.line(L, fy, R, fy);
  font('bold', 11);
  color(BLUE);
  doc.text('Thank you for choosing Vyomi.', W / 2, fy + 8, { align: 'center' });
  font('normal', 8);
  color(MUTED);
  doc.text('Show this receipt or your Member ID at the front desk to collect your access card.', W / 2, fy + 13.5, { align: 'center' });
  doc.text(`${CLUB.email}   ·   ${CLUB.phone}   ·   This is a computer-generated receipt.`, W / 2, fy + 18.5, { align: 'center' });

  return doc;
}
