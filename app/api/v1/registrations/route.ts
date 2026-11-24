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

    // Sanitize string helper
    const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, '').trim();

    const fullName = sanitize(client.fullName || '');
    const phone = (client.phone || '').trim().replace(/\D/g, '');
    const email = sanitize(client.email || '').toLowerCase();
    const dateOfBirth = client.dateOfBirth;
    const gender = client.gender;
    const address = sanitize(client.address || '');
    const fitnessGoal = sanitize(client.fitnessGoal || '');
    const emergencyContactName = sanitize(client.emergencyContactName || '');
    const emergencyContactPhone = (client.emergencyContactPhone || '').trim().replace(/\D/g, '');
    const idProofType = client.idProofType;
    const idProofNumber = sanitize(client.idProofNumber || '');

    // Strict Validations
    if (!fullName || fullName.length < 3 || fullName.split(/\s+/).length < 2) {
      return NextResponse.json({
        error: { code: 'INVALID_NAME', message: 'Full legal name requires both first and last name (letters only).' }
      }, { status: 400 });
    }

    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!phone || !indianMobileRegex.test(phone)) {
      return NextResponse.json({
        error: { code: 'INVALID_PHONE', message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' }
      }, { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({
        error: { code: 'INVALID_EMAIL', message: 'Please enter a valid RFC-compliant email address.' }
      }, { status: 400 });
    }

    if (!dateOfBirth) {
      return NextResponse.json({
        error: { code: 'INVALID_DOB', message: 'Date of birth is required.' }
      }, { status: 400 });
    }

    if (!emergencyContactName || emergencyContactName.length < 2) {
      return NextResponse.json({
        error: { code: 'INVALID_EMERGENCY_NAME', message: 'Emergency contact person name is required (min 2 characters).' }
      }, { status: 400 });
    }

    if (!emergencyContactPhone || !indianMobileRegex.test(emergencyContactPhone)) {
      return NextResponse.json({
        error: { code: 'INVALID_EMERGENCY_PHONE', message: 'Emergency contact phone number must be a valid 10-digit mobile number.' }
      }, { status: 400 });
    }

    if (phone === emergencyContactPhone) {
      return NextResponse.json({
        error: { code: 'SAME_PHONE', message: 'Emergency contact number cannot be identical to your personal mobile number.' }
      }, { status: 400 });
    }

    // Check age
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob.getTime() > Date.now()) {
      return NextResponse.json({
        error: { code: 'INVALID_DOB', message: 'Date of birth cannot be in the future.' }
      }, { status: 400 });
    }

    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 16) {
      return NextResponse.json(
        { error: { code: 'AGE_RESTRICTION', message: 'Minimum age for membership at Vyomi is 16 years.' } },
        { status: 400 }
      );
    }
    if (age < 18 && (!client.guardianName || !client.guardianConsent)) {
      return NextResponse.json(
        { error: { code: 'GUARDIAN_REQUIRED', message: 'Parent or legal guardian consent and full name are mandatory for members under 18.' } },
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
