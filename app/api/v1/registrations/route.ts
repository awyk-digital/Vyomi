import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder, RAZORPAY_KEY_ID } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { packageId, couponCode, client, startDate, preferredSlot, referralSource, acceptedTerms, acceptedWaiver } = body;

    // Validate acceptance
    if (!acceptedTerms || !acceptedWaiver) {
      return NextResponse.json(
        { error: { code: 'TERMS_NOT_ACCEPTED', message: 'You must accept the terms, conditions and health waiver.' } },
        { status: 400 }
      );
    }

    // Validate client details
    if (!client || typeof client !== 'object') {
      return NextResponse.json({ error: { code: 'INVALID_CLIENT', message: 'Client details are required.' } }, { status: 400 });
    }

    const fullName = (client.fullName || '').trim();
    const phone = (client.phone || '').trim().replace(/\D/g, '');
    const email = (client.email || '').trim().toLowerCase();
    const dateOfBirth = client.dateOfBirth;
    const gender = client.gender;
    const address = (client.address || '').trim();
    const fitnessGoal = (client.fitnessGoal || '').trim();
    const emergencyContactName = (client.emergencyContactName || '').trim();
    const emergencyContactPhone = (client.emergencyContactPhone || '').trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: { code: 'INVALID_NAME', message: 'Full name is required (min 2 characters).' } }, { status: 400 });
    }
    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: { code: 'INVALID_PHONE', message: 'Valid 10-digit mobile number is required.' } }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: { code: 'INVALID_EMAIL', message: 'Valid email address is required.' } }, { status: 400 });
    }
    if (!dateOfBirth) {
      return NextResponse.json({ error: { code: 'INVALID_DOB', message: 'Date of birth is required.' } }, { status: 400 });
    }
    if (!emergencyContactName || !emergencyContactPhone) {
      return NextResponse.json({ error: { code: 'INVALID_EMERGENCY', message: 'Emergency contact name and phone are required.' } }, { status: 400 });
    }

    // Check age
    const dob = new Date(dateOfBirth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 16) {
      return NextResponse.json(
        { error: { code: 'AGE_RESTRICTION', message: 'Minimum age for membership is 16 years.' } },
        { status: 400 }
      );
    }
    if (age < 18 && !client.guardianName) {
      return NextResponse.json(
        { error: { code: 'GUARDIAN_REQUIRED', message: 'Guardian consent and name are required for members under 18.' } },
        { status: 400 }
      );
    }

    // Find package
    const pkg = db.findPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: { code: 'PACKAGE_NOT_FOUND', message: 'Selected package was not found.' } }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Create registration in database
    const { registration, client: savedClient, payment } = db.createRegistration({
      clientData: {
        fullName,
        phone,
        email,
        dateOfBirth,
        gender: gender || 'Prefer not to say',
        address: address || 'Vijayawada',
        photoUrl: client.photoUrl || null,
        idProofType: client.idProofType || null,
        idProofNumber: client.idProofNumber || null,
        fitnessGoal: fitnessGoal || 'General Fitness',
        medicalNotes: client.medicalNotes || null,
        emergencyContactName,
        emergencyContactPhone,
        guardianName: client.guardianName || null,
      },
      packageId: pkg.id,
      couponCode,
      startDate: startDate || new Date().toISOString().split('T')[0],
      preferredSlot,
      referralSource,
      acceptedIp: ip,
    });

    // Create order with Razorpay
    const order = await createRazorpayOrder({
      amountPaise: registration.totalPaise,
      receipt: registration.reference,
      notes: {
        registrationId: registration.id,
        packageSlug: pkg.slug,
        clientName: savedClient.fullName,
      },
    });

    // Update payment record with razorpay order ID
    payment.razorpayOrderId = order.id;

    return NextResponse.json({
      registrationRef: registration.reference,
      order: {
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
      },
      summary: {
        price: registration.pricePaise,
        joiningFee: registration.joiningFeePaise,
        discount: registration.discountPaise,
        gst: registration.gstPaise,
        total: registration.totalPaise,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration creation failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
