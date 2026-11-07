/**
 * Inline marker for a business detail still awaiting client confirmation.
 *
 * The brief forbids inventing the address, WhatsApp number, launch date,
 * trainer identities and equipment specifications. Where one of those is not
 * yet confirmed, the UI shows this marker instead of plausible-looking fiction.
 *
 * Every marker disappears on its own once the matching value in
 * `config/site.ts` is filled in.
 */
export default function Pending({
  label,
  className = '',
}: {
  /** What is needed from the client, e.g. 'Verified address'. */
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-burgundy/60 bg-burgundy/10 px-2 py-1 align-middle ${className}`}
      title="Awaiting client confirmation"
    >
      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-burgundy" />
      <span className="t-label text-[0.5625rem] text-muted">{label} — to confirm</span>
    </span>
  );
}
