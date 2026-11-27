import { ImageResponse } from 'next/og';
import { CARD_ART } from './cardArt';

/**
 * Render the finished membership card (tier artwork + member name, ID and
 * valid-thru) as a PNG on the server. Used in the receipt email, where text
 * cannot be reliably layered over a background image in every mail app.
 */
export async function renderMemberCardPng(opts: {
  name?: string;
  memberCode: string;
  endDate?: string;
  packageName: string;
}): Promise<Buffer> {
  const W = 1000;
  const H = 629;
  const tierRaw = (opts.packageName || '').toUpperCase();
  const tier: keyof typeof CARD_ART = tierRaw.includes('VVIP') ? 'VVIP' : tierRaw.includes('VIP') ? 'VIP' : 'FOUNDING';

  const name = (opts.name || '').trim().toUpperCase();
  const nameSize = name.length > 28 ? 40 : name.length > 22 ? 48 : 58;

  const parts = String(opts.memberCode || '').split(/\s*[-·]\s*/).filter(Boolean);
  const head = parts.slice(0, -1).join(' · ');
  const tail = parts[parts.length - 1] || '';

  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(opts.endDate || '');
  const valid = m
    ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : opts.endDate || '';

  const res = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', position: 'relative', color: '#FFFFFF' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CARD_ART[tier]} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }} alt="" />

        <div style={{ position: 'absolute', left: 58, top: 250, display: 'flex', flexDirection: 'column', width: 860 }}>
          <div style={{ fontSize: 24, letterSpacing: 7, color: 'rgba(255,255,255,0.82)' }}>MEMBER</div>
          <div
            style={{
              fontSize: nameSize,
              letterSpacing: 2,
              marginTop: 10,
              display: 'flex',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {name ? (
              name
            ) : (
              <>
                <span style={{ color: '#F2CF6A' }}>V</span>
                <span>&nbsp;CLUB MEMBER</span>
              </>
            )}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 59, top: 456, display: 'flex', fontSize: 36, letterSpacing: 2 }}>
          {head ? <span>{head} ·&nbsp;</span> : null}
          <span style={{ color: '#F2CF6A' }}>{tail}</span>
        </div>

        <div style={{ position: 'absolute', right: 54, top: 456, display: 'flex', fontSize: 36, letterSpacing: 1, color: '#F2CF6A' }}>
          {valid}
        </div>
      </div>
    ),
    { width: W, height: H }
  );

  return Buffer.from(await res.arrayBuffer());
}
