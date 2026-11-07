# Image generation brief — Vyomi Fitness Club

Paste this whole file into Google Antigravity as the task. It is self-contained.

---

## Your task

**Generate 31 images with your image generation tool, and save each one to an
exact path in this repo.** You are creating these pictures, not sourcing them.
Do not download stock, do not reuse existing files, do not leave a slot to be
filled by someone else.

The website already has every image frame built and waiting. Each frame
currently shows a labelled "Asset required" placeholder. Saving a correctly
named file is what replaces it.

## The contract

Save each generated image to an **exact path**. Nothing else needs wiring —
the slot fills itself.

```
public/img/<slot-id>.png
```

Then run once, from the repo root:

```bash
npm run assets:sync
```

That scans `public/img`, matches filenames to slot ids, and points each slot's
`src` at the file in `config/assets.ts`. Any slot without a file keeps showing
its labelled placeholder. Verify with:

```bash
npm run assets:check && npm run build
```

**Do not** edit `config/assets.ts`, any component, or any layout by hand. The
filename *is* the placement. A file named `eq-pin-main.png` lands in the
pin-loaded tab's main image frame and nowhere else.

Accepted extensions: `.png`, `.jpg`, `.webp`, `.avif`. Prefer PNG or high-quality
JPG as the master — Next.js derives responsive AVIF/WebP at build time, so do
**not** hand-export web derivatives.

---

## Style reference — match these two files

| File | What it establishes |
|---|---|
| `public/img/area-reception.png` | The house look. Match it. |
| `public/video/hero-poster.jpg` | The actual club interior, graded. |

Both show the same space: **cream book-matched marble, dark walnut timber,
a terracotta brick feature wall, matte black ceiling with recessed warm
downlights, polished stone floor, boucle cream seating, brushed-gold accents.**

Every generated image must read as **the same building, the same lighting rig,
the same day**. If an image could be a different gym, it is wrong.

---

## Colour grading — apply to every image

This is the single most important requirement. One consistent grade, no
per-image variation in mood.

**Luminance**
- Deep, clean blacks that sit near `#0A0A0A`, never crushed to pure black
- Highlights rolled off — no clipped white on marble or chrome
- Mid-contrast, slightly lifted. Filmic, not punchy

**Colour**
- **Shadows: neutral-to-cool.** A slight blue-grey lean. This is what keeps it
  expensive — warm shadows read cheap
- **Highlights and practicals: restrained warm.** Amber/gold from the downlights
  only, never an overall orange cast
- Overall saturation pulled back roughly 10%. Let the brick and timber carry the
  only strong colour
- Burgundy and terracotta from the equipment and brick may appear, kept muted

**Finish**
- Subtle dark vignette at the edges — felt, not seen
- Crisp material detail: marble veining, timber grain, knurling, brushed metal
- **No** heavy grain, no rugged texture overlays, no muddy shadows, no
  artificial sharpening halos, no plastic CGI surfaces, no lens flares, no bloom

**Camera**
- Architectural realism: verticals straight, no fisheye, no tilted horizon
- 24–35mm equivalent for rooms, 50–85mm for details
- Realistic anatomy and realistic, mechanically plausible equipment

---

## Hard constraints

1. **Do not generate the three trainer portraits.** `trainer-l1`, `trainer-l2`,
   `trainer-l3` need photographs of real staff. A generated face standing in for
   a named real person is not acceptable. Leave these pending.
2. **No fabricated brand marks on equipment.** No invented Panatta logos, model
   plates, serial numbers or spec decals. Burgundy frames are fine; fake
   branding is not.
3. **Category accuracy is not negotiable.**
   - `eq-pin-*` must show a **selectorised stack with a selector pin**. A
     free-weight or plate-loaded machine here is a failure.
   - `eq-plate-*` must show **plates loaded onto sleeves by hand**.
   - `class-reformer` must show an **actual reformer carriage with footbar and
     straps**. Mat work is a failure.
4. **Full machine visible** where the slot says `contain` — `eq-plate-main` and
   `eq-pin-main` render without cropping, so the complete silhouette must fit
   inside the frame with a little breathing room.
5. **No people in room shots** unless the slot asks for them. Empty, composed
   interiors.
6. Every generated interior is conceptual, not photography of the built club.
   The slots below are already flagged `conceptual: true` where that applies, so
   the UI labels them. Do not remove that flag.

---

## The 31 images to generate

Exact output size is given per slot. Match the aspect ratio precisely — the
layout reserves space from it.

### Explore the club — 5

| Save as | Size | Scene |
|---|---|---|
| `area-training-floor.png` | 3840 × 2880 | Wide view down the main strength floor. Rows of burgundy-framed machines receding, rubber flooring, matte black ceiling with warm downlights, mirrored wall at the far end. Empty. |
| `area-studio.png` | 3840 × 2560 | Empty group-class studio. Full-height mirrors one wall, pale timber sprung floor, recessed perimeter lighting, nothing on the floor. |
| `area-wellness.png` | 2560 × 3200 | Portrait. Spa / salt-bath room. Stone tub or salt wall, timber bench, soft low warm light, steam-free, calm. |
| `area-lift.png` | 2560 × 3200 | Portrait. Entrance lobby showing a single dedicated lift. Brushed metal doors, marble surround, warm downlight above. |
| `area-parking.png` | 3840 × 2560 | Covered parking bay at the building entrance. Clean concrete, line markings, warm wall light, a glimpse of the entrance beyond. Night or dusk. |

### Equipment — 9

| Save as | Size | Scene |
|---|---|---|
| `eq-plate-main.png` | 3200 × 2400 | **Full machine in frame, nothing cropped.** A plate-loaded machine, burgundy frame, three-quarter view, plates on the sleeves, on the training floor. |
| `eq-plate-detail-1.png` | 2048 × 2048 | Square. Close on weight plates stacked on a loading sleeve. Shallow depth of field, knurled collar, brushed steel. |
| `eq-plate-detail-2.png` | 2048 × 2560 | Portrait. Close on a handle and its knurling, or an adjustment pin, on that same machine. |
| `eq-pin-main.png` | 3200 × 2400 | **Full machine in frame, including the entire weight stack.** A pin-loaded selectorised machine, burgundy frame, three-quarter view. |
| `eq-pin-detail-1.png` | 2048 × 2048 | Square. Close on a **selector pin inserted into a weight stack**. The stack plates and pin must be unmistakable. |
| `eq-pin-detail-2.png` | 2048 × 2560 | Portrait. Close on the seat adjustment lever or a cable pulley on that same machine. |
| `eq-cond-main.png` | 3200 × 2400 | The conditioning zone. Sled lane on turf, rowing and ski ergs lined up, open floor. Empty. |
| `eq-cond-detail-1.png` | 2048 × 2048 | Square. Close on an erg monitor and flywheel, or a sled handle. |
| `eq-cond-detail-2.png` | 2048 × 2560 | Portrait. Close on turf lane markings, or a sled loaded with plates. |

### Classes — 2 (plus one that needs a decision)

People are allowed in these. Faces, hands and equipment must be correctly
framed and anatomically right — no extra fingers, no impossible grips.

| Save as | Size | Scene |
|---|---|---|
| `class-hyrox.png` | 2400 × 3000 | Portrait. A sled push or wall-ball rep in the conditioning zone. Athletic, mid-effort, motion felt but sharp. |
| `class-strength.png` | 2400 × 3000 | Portrait. A coached barbell or machine set on the training floor. Two people: lifter and coach. |

`class-reformer.png` (2400 × 3000, portrait) — generate **only if** a reformer is
actually part of the offering. It must show a real reformer carriage with
footbar, springs and straps. If unsure, leave it pending and flag it.

### Wellness — 3

| Save as | Size | Scene |
|---|---|---|
| `wellness-main.png` | 3840 × 2160 | Wide landscape. The spa / recovery suite. Natural stone and timber keeping their own colour against the dark scheme. |
| `wellness-salt.png` | 2048 × 2560 | Portrait. The salt bath — tub edge or a backlit salt wall. Controlled highlights, no blown whites. |
| `wellness-detail.png` | 2048 × 2048 | Square. Folded towels on a timber bench, or brushed-brass shower fittings. Quiet still life. |

### Studio page — 11

The Studio page runs five chapters (Fitness, HYROX, Zumba, Wellness, Pilates),
each with its own layout. Wide plates are the establishing shot for a chapter;
details are the supporting frames beside them.

**Wide establishing plates — 3840 × 2160:**

| Save as | Scene |
|---|---|
| `studio-hyrox.png` | The HYROX zone — sled lane and ergs, wide. Different angle from `eq-cond-main`. |
| `studio-zumba.png` | Zumba class mid-movement, warm lighting. People permitted; motion blur acceptable. |
| `studio-wellness.png` | The wellness suite, wide. Different angle from `wellness-main`. |
| `studio-pilates.png` | **A ROW of reformer carriages**, footbars and straps clearly visible. Runs full-bleed at 21:9 — keep the horizon level and the row reading cleanly across the frame. Not mat work. |

**Supporting details:**

| Save as | Size | Scene |
|---|---|---|
| `studio-fitness-detail-a.png` | 2400 × 3000 | Rack or machine detail — knurling, pin, or a hand on a grip. Shallow depth of field. |
| `studio-fitness-detail-b.png` | 3000 × 2400 | Looking down the range, burgundy Panatta frames receding into the room. |
| `studio-hyrox-detail.png` | 3000 × 2400 | A loaded sled on the lane, or an erg handle mid-pull. Motion implied; no faces needed. |
| `studio-zumba-detail-a.png` | 2400 × 3000 | Studio floor and mirror, empty room, reflected lighting. |
| `studio-zumba-detail-b.png` | 2048 × 2048 | Sound system or studio lighting detail. Close, architectural. |
| `studio-pilates-detail-a.png` | 2400 × 3000 | Reformer carriage detail — springs, footbar, shoulder blocks. Shallow depth of field. |
| `studio-pilates-detail-b.png` | 2048 × 2048 | Straps and handles hanging at rest against the carriage. Quiet, still frame. |

> **Pilates is the showpiece chapter.** It is set at hero scale and closes the
> page. Its three images carry more weight than any others in this list — if
> you spend extra attention anywhere, spend it there.

> `studio-classes.png` and `studio-fitness.png` are **no longer used**. The
> Classes chapter was split into Zumba and Pilates, and the Fitness chapter
> now leads with a walkthrough clip instead of a still. Do not generate them.

---

## When you are done

1. `npm run assets:sync` — should report `32/35 slots filled, 3 pending`
   (the three trainer portraits).
2. `npm run build` — must pass.
3. `npm run dev`, then check the homepage and `/studio` at 375px, 768px, 1440px
   and 1920px for: clipped subjects, stretched images, wrong-category imagery in
   the equipment tabs, and any image whose grade drifts from the reference.

Report anything you could not generate rather than substituting something
loosely related. A labelled placeholder is better than a wrong image.
