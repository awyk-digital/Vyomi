# Vyomi — redesign handover

The redesign is implemented across the homepage, the Studio page, and all
breakpoints. This file lists what is still needed from the client before launch.

Nothing below was invented or substituted. Where an approved asset or a
confirmed business detail was missing, the site renders a visibly flagged
placeholder instead of stock photography or plausible-looking fiction.

---

## 1 · Images required — 28 slots

No reference screenshots or interior photography were supplied with the brief.
Only `logo.png`, `hero.mp4` and `hero-poster.jpg` exist in the repository.

Every image slot is declared in [`config/assets.ts`](config/assets.ts) with the
exact shot required, the target master resolution, the crop mode and the focal
point. Each renders on the page as a labelled frame at the correct proportions.

**To supply an asset:** drop the file into `/public/img/` and set `src` on that
slot. Layout space is already reserved from `ratio`, so nothing reflows and no
component code changes.

### Explore the club — 6
| Slot | Shot required | Master |
|---|---|---|
| `area-reception` | Reception and lounge, wide interior | 3840 × 2560 |
| `area-training-floor` | Training floor, wide along the Panatta range | 3840 × 2560 |
| `area-studio` | Studio, empty group-class room | 3840 × 2560 |
| `area-wellness` | Wellness spaces, spa / salt bath interior | 3840 × 2560 |
| `area-lift` | Dedicated lift, entrance lobby | 2560 × 3200 |
| `area-parking` | Parking, covered bay at the entrance | 3840 × 2560 |

### Equipment — 9 (3 per category)
Plate loaded, pin loaded and conditioning each need one full-machine image plus
two details. The two main machine shots render with `object-fit: contain` so the
complete silhouette stays visible.

**Critical:** the pin-loaded slot must show an actual selectorised stack with a
selector pin. A free-weight or plate-loaded photograph here would misrepresent
the category.

### Trainers — 3
`trainer-l1`, `trainer-l2`, `trainer-l3` — 2400 × 3200 portraits of **real staff
members**, matched framing, lighting and lens, waist-up with generous headroom.

Generated portraits must not be used for real people. If a trainer's photo is
unavailable, leave the slot pending rather than substituting.

### Classes — 3
`class-hyrox`, `class-reformer`, `class-strength` — 2400 × 3000.

**Critical:** the reformer slot must show an actual reformer carriage with
footbar and straps. Mat work must not illustrate reformer Pilates.

### Wellness — 3, Studio page — 4
`wellness-main` (16:9 landscape), `wellness-salt`, `wellness-detail`;
`studio-hyrox`, `studio-zumba`, `studio-wellness`, `studio-pilates` — wide
establishing plates at 3840 × 2160.

### Hero video — replacement recommended
The supplied `hero.mp4` is **720 × 1280 portrait, 3 MB**. On a 1920px display it
is upscaled roughly 2× and reads soft. `hero-poster.jpg` is 1920 × 1280
**landscape** — a different framing from the video it stands in for.

Requested: a landscape master at 1080p or better, plus a poster frame taken from
that same footage. A portrait cut for mobile would be a bonus, not a necessity —
the current file already suits a phone viewport.

---

## 2 · Business details required

All of these live in [`config/site.ts`](config/site.ts) as `null`. Each one
currently renders a small "to confirm" marker on the page. Filling the value
removes the marker automatically — no component changes.

| Field | Needed for |
|---|---|
| `whatsappNumber` | Enquiry button, trial request, footer. **Currently disabled** — no number is guessed. |
| `phone` | Location strip, footer |
| `email` | Location strip, footer |
| `instagramUrl` | Footer |
| `address` | Location section, LocalBusiness structured data |
| `coordinates` / `mapsPlaceId` | Map embed and Get Directions. The map is wired and lazy-loaded; it renders as soon as this is set. |
| `presaleDate` | Hero and footer pre-sale line |
| `openingHours` | Location section, structured data |
| `trialTerms` | Client-approved wording and eligibility for the two-day experience |

Also still to confirm, shown as markers in place:

- **Trainer names, specialisations, and what each level covers.** The brief asks
  the level differences be explained with client-approved detail.
- **Equipment range, station counts and loading increments** per category. No
  model names or figures were invented.
- **Full class timetable.** HYROX and reformer Pilates are named in the brief;
  strength & conditioning follows from the confirmed equipment categories.
  Any further classes need confirming before they appear.
- **HYROX station list and affiliation status.** The previous copy claimed
  official-facility status; that claim was removed as unverified.
- **Spa and salt-bath session details.**

### Previously on the site, removed as unverified
The old build contained invented details that have **not** been carried over:
placeholder number `+91 99999 99999`, the address "Level 4, The Monolith Towers,
MG Road, Near Benz Circle", `concierge@vyomifitness.com`, a map embed pointing at
the Vijayawada city centroid, five fictional trainer profiles, and a
"12 November 2026" pre-sale date. Please confirm each one properly.

---

## 3 · Leads are not yet delivered anywhere

`POST /api/trial` validates the payload and returns success, but the lead only
reaches the server log. **It is not emailed, stored, or sent to a CRM.**

A delivery target is required before launch. The route is the single place to
wire it: [`app/api/trial/route.ts`](app/api/trial/route.ts).

The success state deliberately says "Request received… not a confirmed booking",
and the WhatsApp path is labelled a request, so nothing claims a confirmed slot.

---

## 4 · Notes on two brief instructions

**Boska is not loaded.** The type spec reserves it for "only the single
editorial quote". No client-approved quote was supplied, and inventing a member
testimonial is out of bounds, so shipping the family would cost a font request
for nothing. The `--font-quote` token and `.t-quote` class are in place; to
enable it, append `&f[]=boska@500` to the Fontshare link in
[`app/layout.tsx`](app/layout.tsx).

**The footer wordmark now sets in General Sans Medium**, not the old serif face,
for the same reason. The treatment — oversized, low-contrast, clipped at the
bottom edge — is unchanged.

---

## 5 · Before deploying

- Set `NEXT_PUBLIC_SITE_URL` to the production origin so Open Graph image URLs
  resolve absolutely.
- Add a real `favicon.ico`. The layout currently points at `logo.png`, which
  works but is a 934 × 1024 PNG.
- `.next/` is listed in `.gitignore` but ~100 build files were committed in the
  initial commit, so the ignore never took effect. `git rm -r --cached .next`
  clears it.
