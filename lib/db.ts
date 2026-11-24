import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'FRONT_DESK';
export type RegStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type PayMethod = 'RAZORPAY' | 'CASH' | 'POS' | 'BANK_TRANSFER';
export type PayStatus = 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type DiscountType = 'PERCENT' | 'FLAT';

export interface Admin {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // SHA-256 with salt
  salt: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  pricePaise: number;
  joiningFeePaise: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // percentage or paise
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
}

export interface Client {
  id: string;
  memberCode: string | null;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  photoUrl: string | null;
  idProofType: string | null;
  idProofNumber: string | null;
  fitnessGoal: string;
  medicalNotes: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  guardianName: string | null;
  createdAt: string;
}

export interface Registration {
  id: string;
  reference: string;
  clientId: string;
  packageId: string;
  couponId: string | null;
  pricePaise: number;
  joiningFeePaise: number;
  discountPaise: number;
  gstPaise: number;
  totalPaise: number;
  status: RegStatus;
  startDate: string;
  endDate: string | null;
  preferredSlot: string | null;
  referralSource: string | null;
  acceptedTermsAt: string;
  acceptedIp: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  registrationId: string;
  method: PayMethod;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amountPaise: number;
  currency: string;
  status: PayStatus;
  failureReason: string | null;
  refundedPaise: number;
  paidAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string | null;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  processed: boolean;
  receivedAt: string;
}

interface DatabaseSchema {
  admins: Admin[];
  packages: Package[];
  coupons: Coupon[];
  clients: Client[];
  registrations: Registration[];
  payments: Payment[];
  auditLogs: AuditLog[];
  webhookEvents: WebhookEvent[];
  memberSequence: number;
}

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function getInitialData(): DatabaseSchema {
  const salt = 'vyomi_luxury_salt_2026';
  const now = new Date().toISOString();

  const packages: Package[] = [
    {
      id: 'pkg-silver-1m',
      name: 'Silver',
      slug: 'silver',
      durationDays: 30,
      pricePaise: 350000, // ₹3,500
      joiningFeePaise: 0,
      benefits: [
        'Full gym floor & strength zone access',
        'Complimentary luxury day locker',
        '5 group fitness classes per month',
        'Initial movement & posture screen',
      ],
      isActive: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pkg-gold-3m',
      name: 'Gold',
      slug: 'gold',
      durationDays: 90,
      pricePaise: 900000, // ₹9,000
      joiningFeePaise: 0,
      benefits: [
        'All Silver membership privileges',
        '2 One-on-one personal trainer sessions',
        'Unlimited steam bath & cedar sauna access',
        'Bi-monthly body composition telemetry',
      ],
      isActive: true,
      sortOrder: 2,
      isFeatured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pkg-platinum-6m',
      name: 'Platinum',
      slug: 'platinum',
      durationDays: 180,
      pricePaise: 1600000, // ₹16,000
      joiningFeePaise: 0,
      benefits: [
        'All Gold membership privileges',
        '6 Dedicated personal training sessions',
        'Comprehensive clinical diet consultation',
        '4 Complimentary guest VIP day passes',
        'Priority studio & reformer slot reservations',
      ],
      isActive: true,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pkg-diamond-12m',
      name: 'Diamond',
      slug: 'diamond',
      durationDays: 365,
      pricePaise: 2800000, // ₹28,000
      joiningFeePaise: 0,
      benefits: [
        'All Platinum membership privileges',
        'Full-year tailored personal trainer blueprint',
        'Cold plunge hydrotherapy & recovery suite access',
        'Unlimited guest privileges & private locker',
        'Vyomi bespoke member welcome apparel kit',
      ],
      isActive: true,
      sortOrder: 4,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const coupons: Coupon[] = [
    {
      id: 'cpn-newyear10',
      code: 'NEWYEAR10',
      discountType: 'PERCENT',
      discountValue: 10,
      maxUses: 100,
      usedCount: 3,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      isActive: true,
    },
    {
      id: 'cpn-vyomi1000',
      code: 'VYOMI1000',
      discountType: 'FLAT',
      discountValue: 100000, // ₹1,000
      maxUses: 50,
      usedCount: 2,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      isActive: true,
    },
    {
      id: 'cpn-vip15',
      code: 'PREMIUMVIP',
      discountType: 'PERCENT',
      discountValue: 15,
      maxUses: 25,
      usedCount: 1,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      isActive: true,
    },
  ];

  const admins: Admin[] = [
    {
      id: 'admin-super-01',
      name: 'Vyomi Super Admin',
      email: 'admin@vyomi.com',
      passwordHash: hashPassword('vyomi2026', salt),
      salt,
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
    },
    {
      id: 'admin-mgr-01',
      name: 'Club Operations Manager',
      email: 'manager@vyomi.com',
      passwordHash: hashPassword('vyomi2026', salt),
      salt,
      role: 'MANAGER',
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
    },
    {
      id: 'admin-front-01',
      name: 'Front Desk Concierge',
      email: 'frontdesk@vyomi.com',
      passwordHash: hashPassword('vyomi2026', salt),
      salt,
      role: 'FRONT_DESK',
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
    },
  ];

  // Seed sample clients
  const client1: Client = {
    id: 'cli-001',
    memberCode: 'VYO-2026-000101',
    fullName: 'Aditya Varma',
    phone: '9849012345',
    email: 'aditya.varma@gmail.com',
    dateOfBirth: '1992-06-15',
    gender: 'Male',
    address: 'Plot 42, Gayatri Nagar, Vijayawada',
    photoUrl: null,
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-4512',
    fitnessGoal: 'Hypertrophy & athletic conditioning',
    medicalNotes: 'None',
    emergencyContactName: 'Sunita Varma',
    emergencyContactPhone: '9849098765',
    guardianName: null,
    createdAt: '2026-11-12T10:30:00Z',
  };

  const reg1: Registration = {
    id: 'reg-001',
    reference: 'REG-20261112-9A4B',
    clientId: 'cli-001',
    packageId: 'pkg-gold-3m',
    couponId: 'cpn-newyear10',
    pricePaise: 900000,
    joiningFeePaise: 0,
    discountPaise: 90000,
    gstPaise: 145800,
    totalPaise: 955800,
    status: 'CONFIRMED',
    startDate: '2026-11-15',
    endDate: '2027-02-13',
    preferredSlot: 'morning',
    referralSource: 'Instagram',
    acceptedTermsAt: '2026-11-12T10:32:00Z',
    acceptedIp: '127.0.0.1',
    notes: 'Member verified in person by concierge.',
    createdAt: '2026-11-12T10:30:00Z',
    updatedAt: '2026-11-12T10:35:00Z',
  };

  const pay1: Payment = {
    id: 'pay-001',
    registrationId: 'reg-001',
    method: 'RAZORPAY',
    razorpayOrderId: 'order_VYOMI_TEST_101',
    razorpayPaymentId: 'pay_VYOMI_TEST_901',
    razorpaySignature: 'sig_mock_verified_101',
    amountPaise: 955800,
    currency: 'INR',
    status: 'PAID',
    failureReason: null,
    refundedPaise: 0,
    paidAt: '2026-11-12T10:35:00Z',
    createdAt: '2026-11-12T10:31:00Z',
  };

  const client2: Client = {
    id: 'cli-002',
    memberCode: 'VYO-2026-000102',
    fullName: 'Ananya Reddy',
    phone: '9988776655',
    email: 'ananya.reddy@outlook.com',
    dateOfBirth: '1996-09-22',
    gender: 'Female',
    address: 'Moghalrajpuram, Vijayawada',
    photoUrl: null,
    idProofType: 'PAN',
    idProofNumber: 'XXXXX9876X',
    fitnessGoal: 'Reformer Pilates & stamina',
    medicalNotes: 'Mild lower back sensitivity',
    emergencyContactName: 'Kishore Reddy',
    emergencyContactPhone: '9988776611',
    guardianName: null,
    createdAt: '2026-11-16T14:15:00Z',
  };

  const reg2: Registration = {
    id: 'reg-002',
    reference: 'REG-20261116-2F7K',
    clientId: 'cli-002',
    packageId: 'pkg-platinum-6m',
    couponId: null,
    pricePaise: 1600000,
    joiningFeePaise: 0,
    discountPaise: 0,
    gstPaise: 288000,
    totalPaise: 1888000,
    status: 'CONFIRMED',
    startDate: '2026-11-20',
    endDate: '2027-05-19',
    preferredSlot: 'evening',
    referralSource: 'Word of mouth',
    acceptedTermsAt: '2026-11-16T14:16:00Z',
    acceptedIp: '127.0.0.1',
    notes: 'Requested Pilates reformer orientation.',
    createdAt: '2026-11-16T14:15:00Z',
    updatedAt: '2026-11-16T14:18:00Z',
  };

  const pay2: Payment = {
    id: 'pay-002',
    registrationId: 'reg-002',
    method: 'POS',
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    amountPaise: 1888000,
    currency: 'INR',
    status: 'PAID',
    failureReason: null,
    refundedPaise: 0,
    paidAt: '2026-11-16T14:18:00Z',
    createdAt: '2026-11-16T14:15:00Z',
  };

  return {
    admins,
    packages,
    coupons,
    clients: [client1, client2],
    registrations: [reg1, reg2],
    payments: [pay1, pay2],
    auditLogs: [
      {
        id: 'aud-001',
        adminId: 'admin-super-01',
        adminName: 'Vyomi Super Admin',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        entityId: 'init',
        details: { note: 'Vyomi Luxury Registration & Admin Panel initialized' },
        createdAt: now,
      },
    ],
    webhookEvents: [],
    memberSequence: 103,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database.json, initializing fresh data', err);
    }

    const init = getInitialData();
    this.saveDirect(init);
    return init;
  }

  private saveDirect(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database.json', err);
    }
  }

  private persist(): void {
    this.saveDirect(this.data);
  }

  // ----------------- ADMINS -----------------
  getAdmins(): Admin[] {
    return this.data.admins;
  }

  findAdminByEmail(email: string): Admin | undefined {
    return this.data.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  findAdminById(id: string): Admin | undefined {
    return this.data.admins.find((a) => a.id === id);
  }

  verifyAdminPassword(admin: Admin, password: string): boolean {
    const computed = hashPassword(password, admin.salt);
    return computed === admin.passwordHash;
  }

  updateAdminLogin(id: string): void {
    const a = this.findAdminById(id);
    if (a) {
      a.lastLoginAt = new Date().toISOString();
      this.persist();
    }
  }

  saveAdmin(admin: Omit<Admin, 'id' | 'createdAt' | 'salt' | 'passwordHash'> & { password?: string }): Admin {
    const salt = 'vyomi_salt_' + Math.random().toString(36).substring(2, 8);
    const newAdmin: Admin = {
      id: 'admin-' + crypto.randomUUID().substring(0, 8),
      name: admin.name,
      email: admin.email,
      passwordHash: hashPassword(admin.password || 'vyomi2026', salt),
      salt,
      role: admin.role,
      isActive: admin.isActive ?? true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
    };
    this.data.admins.push(newAdmin);
    this.persist();
    return newAdmin;
  }

  // ----------------- PACKAGES -----------------
  getPackages(activeOnly = true): Package[] {
    const pkgs = activeOnly ? this.data.packages.filter((p) => p.isActive) : this.data.packages;
    return [...pkgs].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  findPackageById(id: string): Package | undefined {
    return this.data.packages.find((p) => p.id === id || p.slug === id);
  }

  updatePackage(id: string, updates: Partial<Package>): Package | null {
    const p = this.findPackageById(id);
    if (!p) return null;
    Object.assign(p, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return p;
  }

  // ----------------- COUPONS -----------------
  getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  findCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
  }

  validateCoupon(code: string, packagePricePaise: number): {
    valid: boolean;
    discountPaise: number;
    coupon?: Coupon;
    message?: string;
  } {
    const coupon = this.findCouponByCode(code);
    if (!coupon) {
      return { valid: false, discountPaise: 0, message: 'Invalid or inactive coupon code.' };
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, discountPaise: 0, message: 'Coupon code not yet active.' };
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, discountPaise: 0, message: 'Coupon code has expired.' };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discountPaise: 0, message: 'Coupon usage limit reached.' };
    }

    let discountPaise = 0;
    if (coupon.discountType === 'PERCENT') {
      discountPaise = Math.round((packagePricePaise * coupon.discountValue) / 100);
    } else {
      discountPaise = coupon.discountValue;
    }

    discountPaise = Math.min(discountPaise, packagePricePaise);

    return {
      valid: true,
      discountPaise,
      coupon,
    };
  }

  // ----------------- CLIENTS -----------------
  findClientByPhone(phone: string): Client | undefined {
    const clean = phone.replace(/\D/g, '');
    return this.data.clients.find((c) => c.phone.replace(/\D/g, '') === clean);
  }

  findClientById(id: string): Client | undefined {
    return this.data.clients.find((c) => c.id === id);
  }

  createOrUpdateClient(data: Omit<Client, 'id' | 'memberCode' | 'createdAt'>): Client {
    const existing = this.findClientByPhone(data.phone);
    if (existing) {
      Object.assign(existing, data);
      this.persist();
      return existing;
    }

    const client: Client = {
      ...data,
      id: 'cli-' + crypto.randomUUID().substring(0, 8),
      memberCode: null,
      createdAt: new Date().toISOString(),
    };
    this.data.clients.push(client);
    this.persist();
    return client;
  }

  assignMemberCode(clientId: string): string {
    const client = this.findClientById(clientId);
    if (!client) throw new Error('Client not found');
    if (client.memberCode) return client.memberCode;

    const seq = this.data.memberSequence++;
    const code = `VYO-2026-${seq.toString().padStart(6, '0')}`;
    client.memberCode = code;
    this.persist();
    return code;
  }

  // ----------------- REGISTRATIONS & PAYMENTS -----------------
  createRegistration(params: {
    clientData: Omit<Client, 'id' | 'memberCode' | 'createdAt'>;
    packageId: string;
    couponCode?: string;
    startDate: string;
    preferredSlot?: string;
    referralSource?: string;
    acceptedIp: string;
  }): { registration: Registration; client: Client; pkg: Package; payment: Payment } {
    const pkg = this.findPackageById(params.packageId);
    if (!pkg) throw new Error('Selected package not found');

    const client = this.createOrUpdateClient(params.clientData);

    let couponId: string | null = null;
    let discountPaise = 0;
    if (params.couponCode) {
      const cv = this.validateCoupon(params.couponCode, pkg.pricePaise);
      if (cv.valid && cv.coupon) {
        couponId = cv.coupon.id;
        discountPaise = cv.discountPaise;
      }
    }

    const pricePaise = pkg.pricePaise;
    const joiningFeePaise = pkg.joiningFeePaise || 0;
    const netTaxable = Math.max(0, pricePaise + joiningFeePaise - discountPaise);
    // GST 18% standard for gym services in India
    const gstPaise = Math.round(netTaxable * 0.18);
    const totalPaise = netTaxable + gstPaise;

    const refDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const reference = `REG-${refDate}-${randSuffix}`;

    const regId = 'reg-' + crypto.randomUUID().substring(0, 8);
    const registration: Registration = {
      id: regId,
      reference,
      clientId: client.id,
      packageId: pkg.id,
      couponId,
      pricePaise,
      joiningFeePaise,
      discountPaise,
      gstPaise,
      totalPaise,
      status: 'PENDING',
      startDate: params.startDate,
      endDate: null,
      preferredSlot: params.preferredSlot || null,
      referralSource: params.referralSource || null,
      acceptedTermsAt: new Date().toISOString(),
      acceptedIp: params.acceptedIp,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const payment: Payment = {
      id: 'pay-' + crypto.randomUUID().substring(0, 8),
      registrationId: regId,
      method: 'RAZORPAY',
      razorpayOrderId: `order_vyo_${reference}`,
      razorpayPaymentId: null,
      razorpaySignature: null,
      amountPaise: totalPaise,
      currency: 'INR',
      status: 'CREATED',
      failureReason: null,
      refundedPaise: 0,
      paidAt: null,
      createdAt: new Date().toISOString(),
    };

    this.data.registrations.push(registration);
    this.data.payments.push(payment);
    this.persist();

    return { registration, client, pkg, payment };
  }

  findRegistrationByRef(reference: string): (Registration & { client?: Client; package?: Package; payment?: Payment }) | null {
    const reg = this.data.registrations.find((r) => r.reference === reference || r.id === reference);
    if (!reg) return null;
    const client = this.findClientById(reg.clientId);
    const pkg = this.findPackageById(reg.packageId);
    const payment = this.data.payments.find((p) => p.registrationId === reg.id);
    return { ...reg, client, package: pkg, payment };
  }

  confirmPaymentAndRegistration(params: {
    registrationRef: string;
    paymentId?: string;
    signature?: string;
    method?: PayMethod;
  }): { registration: Registration; client: Client; memberCode: string } {
    const reg = this.data.registrations.find(
      (r) => r.reference === params.registrationRef || r.id === params.registrationRef
    );
    if (!reg) throw new Error('Registration not found');

    const client = this.findClientById(reg.clientId);
    if (!client) throw new Error('Client not found');

    const pkg = this.findPackageById(reg.packageId);
    if (!pkg) throw new Error('Package not found');

    const payment = this.data.payments.find((p) => p.registrationId === reg.id);
    if (payment) {
      payment.status = 'PAID';
      payment.paidAt = new Date().toISOString();
      if (params.paymentId) payment.razorpayPaymentId = params.paymentId;
      if (params.signature) payment.razorpaySignature = params.signature;
      if (params.method) payment.method = params.method;
    }

    reg.status = 'CONFIRMED';
    reg.updatedAt = new Date().toISOString();

    // Compute end date: start date + package duration days
    const start = new Date(reg.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + pkg.durationDays);
    reg.endDate = end.toISOString().split('T')[0];

    // Assign Member ID if not already assigned
    const memberCode = this.assignMemberCode(client.id);

    // Increment coupon used count if used
    if (reg.couponId) {
      const c = this.data.coupons.find((cp) => cp.id === reg.couponId);
      if (c) c.usedCount++;
    }

    this.logAudit({
      adminId: null,
      adminName: 'SYSTEM / RAZORPAY',
      action: 'PAYMENT_CONFIRMED',
      entityType: 'REGISTRATION',
      entityId: reg.id,
      details: {
        reference: reg.reference,
        amount: reg.totalPaise / 100,
        memberCode,
        paymentId: params.paymentId || 'MANUAL',
      },
    });

    this.persist();
    return { registration: reg, client, memberCode };
  }

  markRegistrationFailed(reference: string, reason: string): void {
    const reg = this.data.registrations.find((r) => r.reference === reference);
    if (reg) {
      reg.status = 'FAILED';
      reg.updatedAt = new Date().toISOString();
      const p = this.data.payments.find((pay) => pay.registrationId === reg.id);
      if (p) {
        p.status = 'FAILED';
        p.failureReason = reason;
      }
      this.persist();
    }
  }

  refundRegistration(regId: string, adminId: string, adminName: string, reason?: string): boolean {
    const reg = this.data.registrations.find((r) => r.id === regId || r.reference === regId);
    if (!reg) return false;

    reg.status = 'CANCELLED';
    reg.updatedAt = new Date().toISOString();

    const p = this.data.payments.find((pay) => pay.registrationId === reg.id);
    if (p) {
      p.status = 'REFUNDED';
      p.refundedPaise = p.amountPaise;
      p.failureReason = reason || 'Admin initiated refund';
    }

    this.logAudit({
      adminId,
      adminName,
      action: 'REGISTRATION_REFUNDED',
      entityType: 'REGISTRATION',
      entityId: reg.id,
      details: { reference: reg.reference, refundedPaise: reg.totalPaise, reason },
    });

    this.persist();
    return true;
  }

  // ----------------- AUDIT LOGS -----------------
  logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): void {
    const entry: AuditLog = {
      ...log,
      id: 'aud-' + crypto.randomUUID().substring(0, 8),
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) this.data.auditLogs.pop();
    this.persist();
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // ----------------- STATS & REPORTS -----------------
  getDashboardStats() {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const confirmedRegs = this.data.registrations.filter((r) => r.status === 'CONFIRMED');

    const newToday = confirmedRegs.filter((r) => r.createdAt.startsWith(todayStr)).length;
    const newMonth = confirmedRegs.filter((r) => r.createdAt >= startOfMonth).length;

    const paidPayments = this.data.payments.filter((p) => p.status === 'PAID');
    const revTodayPaise = paidPayments
      .filter((p) => (p.paidAt || p.createdAt).startsWith(todayStr))
      .reduce((sum, p) => sum + (p.amountPaise - p.refundedPaise), 0);
    const revMonthPaise = paidPayments
      .filter((p) => (p.paidAt || p.createdAt) >= startOfMonth)
      .reduce((sum, p) => sum + (p.amountPaise - p.refundedPaise), 0);

    const activeMembers = confirmedRegs.filter((r) => {
      if (!r.endDate) return false;
      return new Date(r.endDate) >= now;
    }).length;

    const pendingCount = this.data.registrations.filter((r) => r.status === 'PENDING').length;

    // Expiring in 7 days
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    const expiringSoon = confirmedRegs.filter((r) => {
      if (!r.endDate) return false;
      const d = new Date(r.endDate);
      return d >= now && d <= in7Days;
    }).length;

    // Package breakdown
    const pkgCounts: Record<string, { name: string; count: number; revenuePaise: number }> = {};
    for (const r of confirmedRegs) {
      const p = this.findPackageById(r.packageId);
      const name = p ? p.name : 'Unknown';
      if (!pkgCounts[name]) pkgCounts[name] = { name, count: 0, revenuePaise: 0 };
      pkgCounts[name].count++;
      pkgCounts[name].revenuePaise += r.totalPaise;
    }

    // Payment methods breakdown
    const methodCounts: Record<string, number> = {};
    for (const p of paidPayments) {
      methodCounts[p.method] = (methodCounts[p.method] || 0) + 1;
    }

    // Recent 10 registrations
    const recent = [...this.data.registrations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((r) => ({
        ...r,
        client: this.findClientById(r.clientId),
        package: this.findPackageById(r.packageId),
        payment: this.data.payments.find((p) => p.registrationId === r.id),
      }));

    return {
      newToday,
      newMonth,
      revenueTodayPaise: revTodayPaise,
      revenueMonthPaise: revMonthPaise,
      activeMembers,
      pendingCount,
      expiringSoon,
      packageBreakdown: Object.values(pkgCounts),
      methodBreakdown: methodCounts,
      recent,
    };
  }

  // ----------------- QUERY REGISTRATIONS -----------------
  queryRegistrations(params: {
    q?: string;
    status?: string;
    packageId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    let list = this.data.registrations.map((r) => ({
      ...r,
      client: this.findClientById(r.clientId),
      package: this.findPackageById(r.packageId),
      payment: this.data.payments.find((p) => p.registrationId === r.id),
    }));

    if (params.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter((r) => {
        const clientName = r.client?.fullName.toLowerCase() || '';
        const clientPhone = r.client?.phone.toLowerCase() || '';
        const clientEmail = r.client?.email.toLowerCase() || '';
        const memberCode = r.client?.memberCode?.toLowerCase() || '';
        const ref = r.reference.toLowerCase();
        return (
          clientName.includes(q) ||
          clientPhone.includes(q) ||
          clientEmail.includes(q) ||
          memberCode.includes(q) ||
          ref.includes(q)
        );
      });
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((r) => r.status === params.status);
    }

    if (params.packageId && params.packageId !== 'ALL') {
      list = list.filter((r) => r.packageId === params.packageId);
    }

    if (params.from) {
      list = list.filter((r) => r.createdAt >= params.from!);
    }
    if (params.to) {
      list = list.filter((r) => r.createdAt <= params.to!);
    }

    // Sorting
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return params.sort === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 20);
    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ----------------- QUERY PAYMENTS -----------------
  getPaymentsList() {
    return this.data.payments
      .map((p) => {
        const reg = this.data.registrations.find((r) => r.id === p.registrationId);
        const client = reg ? this.findClientById(reg.clientId) : undefined;
        const pkg = reg ? this.findPackageById(reg.packageId) : undefined;
        return {
          ...p,
          registration: reg,
          client,
          package: pkg,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Singleton instance
export const db = new Database();
