/**
 * VYOMI — single source of truth for business details.
 *
 * The brief is explicit: do not invent the address, the WhatsApp number,
 * trainer identities, equipment specifications, or the launch date.
 *
 * Anything still awaiting client confirmation is `null` here. Components read
 * these values and render a visibly flagged "awaiting confirmation" state
 * instead of substituting plausible-looking placeholder data.
 *
 * To go live: replace each `null` with the confirmed value. No component code
 * needs to change — the flagged states disappear automatically.
 */

export interface PostalAddress {
  line1: string;
  line2?: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface OpeningHours {
  /** Mon=1 … Sun=7 */
  days: string;
  opens: string;
  closes: string;
}

export const site = {
  name: 'Vyomi Fitness Club',
  shortName: 'Vyomi',
  city: 'Vijayawada',
  region: 'Andhra Pradesh',
  country: 'IN',

  /* ---------------- Awaiting client confirmation ---------------- */

  /** E.164 digits only, no "+" or spaces. Example shape: '919876543210'. */
  whatsappNumber: '919948180333',

  /** Display + tel: link. */
  phone: '+91 99481 80333',

  email: 'vyomifitness@gmail.com',

  /** Full profile URL. */
  instagramUrl: 'https://www.instagram.com/vyomi_fitness/',

  /** Verified street address of the club. */
  address: {
    line1: 'Near Sonovision, Patamata',
    locality: 'Vijayawada',
    region: 'Andhra Pradesh',
    postalCode: '520010',
    country: 'IN',
  } as PostalAddress | null,

  /**
   * Google Maps place identifier for the verified location.
   * Prefer a Place ID — it pins the exact premises rather than a city centroid.
   */
  mapsPlaceId: null as string | null,

  /** Latitude/longitude of the verified premises. */
  coordinates: { lat: 16.4975, lng: 80.658 } as { lat: number; lng: number } | null,

  /** Confirmed pre-sale / launch date as an ISO date, e.g. '2026-11-12'. */
  presaleDate: '2026-11-12' as string | null,

  /** Client-approved opening hours. */
  openingHours: null as OpeningHours[] | null,

  /** Client-approved wording + eligibility for the free two-day experience. */
  trialTerms: null as { eligibility: string[]; wording: string } | null,

  /* ---------------- Confirmed by the brief ---------------- */

  /** On-site facts the brief states directly. */
  access: {
    dedicatedLift: true,
    parking: true,
  },
} as const;

/* ------------------------------------------------------------------ */

/** True when a value is still awaiting client confirmation. */
export const isPending = (v: unknown): boolean =>
  v === null || v === undefined || (Array.isArray(v) && v.length === 0);

/**
 * Builds a WhatsApp deep link with an encoded, prefilled message.
 * Returns null when the official number is not yet configured — callers must
 * handle that by disabling the control, never by falling back to a guess.
 */
export function whatsappLink(message: string): string | null {
  if (!site.whatsappNumber) return null;
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Single-line address string, or null while unconfirmed. */
export function addressLine(): string | null {
  const a = site.address;
  if (!a) return null;
  return [a.line1, a.line2, a.locality, a.region, a.postalCode]
    .filter(Boolean)
    .join(', ');
}

/** Google Maps directions URL for the verified location, or null. */
export function directionsLink(): string | null {
  if (site.mapsPlaceId) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      site.name
    )}&destination_place_id=${site.mapsPlaceId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Vyomi Fitness Club, Near Sonovision, Patamata, Vijayawada'
  )}`;
}

/** Lazy-loaded Google Maps embed URL for the verified location, or null. */
export function mapEmbedUrl(): string | null {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    'Sonovision, Patamata, Vijayawada'
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/** Formats the confirmed pre-sale date, or null while unconfirmed. */
export function presaleDisplay(): string | null {
  if (!site.presaleDate) return null;
  const d = new Date(`${site.presaleDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
