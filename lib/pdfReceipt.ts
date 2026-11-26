import { jsPDF } from 'jspdf';

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
  amountInr: number;
  paymentMethod: 'UPI' | 'CASH';
  paymentStatus: 'PAID' | 'PENDING_CASH_COLLECTION';
  utrNumber?: string;
  paymentDate: string;
}

export function generatePdfReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Background tint: ultra-soft luxury ivory
  doc.setFillColor(252, 251, 248);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Top Accent Bar (Champagne Gold)
  doc.setFillColor(197, 160, 89);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 16, pageWidth - 28, 42, 3, 3, 'F');
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(14, 16, pageWidth - 28, 42, 3, 3, 'S');

  // Club Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27);
  doc.text('VYOMI FITNESS CLUB', 22, 28);

  // Subtitle & Contact
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 105);
  doc.text('Elevate Your Fitness · Luxury Wellness, HYROX & Panatta Equipment', 22, 34);
  doc.text('4th Floor, Sonovision Durga Plaza, Benz Circle, Patamata, Vijayawada, AP 520010', 22, 39);
  doc.text('Phone: +91 99481 80333  |  Email: vyomifitness@gmail.com', 22, 44);

  // Badge on the right
  doc.setFillColor(245, 242, 235);
  doc.roundedRect(pageWidth - 75, 22, 58, 28, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(179, 142, 54);
  doc.text('OFFICIAL MEMBERSHIP RECEIPT', pageWidth - 72, 28);
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text(data.receiptNumber, pageWidth - 72, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 125);
  doc.text(`Date: ${data.paymentDate}`, pageWidth - 72, 41);

  // Member & Membership Info Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 64, pageWidth - 28, 54, 3, 3, 'F');
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(14, 64, pageWidth - 28, 54, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text('Member Information', 22, 74);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Enrollment Particulars', pageWidth / 2 + 5, 74);

  doc.setDrawColor(240, 237, 230);
  doc.line(22, 77, pageWidth - 22, 77);

  // Left Column (Member Details)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 105);

  doc.text('Full Name:', 22, 85);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text(data.clientName, 52, 85);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 105);
  doc.text('Member ID:', 22, 92);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(179, 142, 54);
  doc.text(data.memberCode, 52, 92);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 105);
  doc.text('Mobile No:', 22, 99);
  doc.setTextColor(24, 24, 27);
  doc.text(`+91 ${data.phone}`, 52, 99);

  doc.setTextColor(100, 100, 105);
  doc.text('Email:', 22, 106);
  doc.setTextColor(24, 24, 27);
  doc.text(data.email, 52, 106);

  if (data.fitnessGoal) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 105);
    doc.text('Training Focus:', 22, 113);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(179, 142, 54);
    doc.text(data.fitnessGoal, 52, 113);
  }

  // Right Column (Membership Particulars)
  doc.setTextColor(100, 100, 105);
  doc.text('Plan Name:', pageWidth / 2 + 5, 85);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text(data.packageName, pageWidth / 2 + 40, 85);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 105);
  doc.text('Duration:', pageWidth / 2 + 5, 92);
  doc.setTextColor(24, 24, 27);
  doc.text(`${data.durationDays} Days (1 Year Access)`, pageWidth / 2 + 40, 92);

  doc.setTextColor(100, 100, 105);
  doc.text('Time Slot:', pageWidth / 2 + 5, 99);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(179, 142, 54);
  doc.text(data.timeSlot, pageWidth / 2 + 40, 99);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 105);
  doc.text('Valid Period:', pageWidth / 2 + 5, 106);
  doc.setTextColor(24, 24, 27);
  doc.text(`${data.startDate} to ${data.endDate}`, pageWidth / 2 + 40, 106);

  // Billing & Charges Table
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 124, pageWidth - 28, 70, 3, 3, 'F');
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(14, 124, pageWidth - 28, 70, 3, 3, 'S');

  // Table Header
  doc.setFillColor(245, 242, 235);
  doc.rect(14, 124, pageWidth - 28, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text('DESCRIPTION', 22, 130.5);
  doc.text('SAC CODE', pageWidth - 80, 130.5);
  doc.text('AMOUNT (INR)', pageWidth - 45, 130.5);

  // Table Row 1: Plan
  const taxableAmount = Math.round(data.amountInr / 1.18);
  const gstAmount = data.amountInr - taxableAmount;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text(`${data.packageName} — Annual Admission Fee`, 22, 142);
  doc.text('999723', pageWidth - 80, 142);
  doc.text(`INR ${taxableAmount.toLocaleString('en-IN')}`, pageWidth - 45, 142);

  // Table Row 2: Locker & Facilities
  doc.text('Club Locker, Hydro Suite & Equipment Access', 22, 150);
  doc.text('999723', pageWidth - 80, 150);
  doc.setTextColor(16, 185, 129);
  doc.text('Included', pageWidth - 45, 150);

  // Table Row 3: GST
  doc.setTextColor(100, 100, 105);
  doc.text('Integrated GST (18%)', 22, 158);
  doc.text('18.00%', pageWidth - 80, 158);
  doc.setTextColor(24, 24, 27);
  doc.text(`INR ${gstAmount.toLocaleString('en-IN')}`, pageWidth - 45, 158);

  // Divider
  doc.setDrawColor(230, 226, 218);
  doc.line(22, 166, pageWidth - 22, 166);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Amount Payable / Received:', 22, 176);
  doc.setFontSize(14);
  doc.setTextColor(179, 142, 54);
  doc.text(`INR ${data.amountInr.toLocaleString('en-IN')}`, pageWidth - 55, 176);

  // Payment Settlement Info Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 200, pageWidth - 28, 40, 3, 3, 'F');
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(14, 200, pageWidth - 28, 40, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text('Payment Settlement Details', 22, 210);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 105);
  doc.text('Payment Method:', 22, 219);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text(
    data.paymentMethod === 'UPI' ? 'UPI QR Payment (Direct Settlement)' : 'Cash Payment (At Club Front Desk)',
    65,
    219
  );

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 105);
  doc.text('Payment Status:', 22, 226);
  doc.setFont('helvetica', 'bold');
  if (data.paymentStatus === 'PAID') {
    doc.setTextColor(16, 185, 129);
    doc.text('CONFIRMED / COMPLETED', 65, 226);
  } else {
    doc.setTextColor(179, 142, 54);
    doc.text('PENDING CASH COLLECTION AT RECEPTION', 65, 226);
  }

  if (data.utrNumber) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 105);
    doc.text('UPI / UTR Reference:', 22, 233);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 24, 27);
    doc.text(data.utrNumber, 65, 233);
  }

  // Footer / Club Verification Stamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 135);
  doc.text(
    'This is a computer-generated official receipt issued by Vyomi Fitness Club, Vijayawada.',
    22,
    254
  );
  doc.text(
    'Please present this digital receipt or your Member ID at the front desk to collect your biometric access card.',
    22,
    259
  );

  // Bottom Gold Accent Bar
  doc.setFillColor(197, 160, 89);
  doc.rect(0, 292, pageWidth, 5, 'F');

  return doc;
}
