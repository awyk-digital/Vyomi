'use client';

import { useId, useState } from 'react';
import AssetSlot from '@/components/AssetSlot';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { EQUIPMENT_CATEGORIES } from '@/data/club';

/**
 * Facilities & equipment.
 *
 * Composition deliberately differs from the gallery: the heading spans the
 * upper area, then one medium plate sits left with two smaller details stacked
 * and offset to the right.
 *
 * Category selectors are a real tablist — arrow keys move between them — and
 * switching a category swaps both the imagery and the specification rows.
 * Specifications stay blank until the client confirms them; no model names or
 * numbers are invented, and the pin-loaded tab never borrows a free-weight
 * photograph.
 */
export default function EquipmentSection() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const category = EQUIPMENT_CATEGORIES[active];
  const [main, detail1, detail2] = category.images;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next =
      (active + dir + EQUIPMENT_CATEGORIES.length) % EQUIPMENT_CATEGORIES.length;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section
      id="equipment"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="equipment-heading"
    >
      {/* Heading across the upper area */}
      <div className="mb-10 md:mb-14">
        <SectionHeading
          id="equipment-heading"
          className="t-h2 uppercase text-heading"
        >
          {'Premium equipment.\nSerious training.'}
        </SectionHeading>
        <div className="mt-7 max-w-shell">
          <AccentRule />
        </div>
      </div>

      {/* Category selectors */}
      <div
        role="tablist"
        aria-label="Equipment category"
        onKeyDown={onKeyDown}
        className="mb-10 flex flex-wrap gap-2 border-b border-hairline pb-6"
      >
        {EQUIPMENT_CATEGORIES.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              id={`${baseId}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`t-ui border px-4 py-2.5 transition-colors duration-300 ${
                selected
                  ? 'border-heading bg-heading text-ink'
                  : 'border-hairline-2 text-muted hover:border-heading/40 hover:text-heading'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Asymmetric plate + details */}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      >
        {/* Medium main image */}
        <div className="lg:col-span-7">
          <AssetSlot
            key={main.id}
            slot={main}
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="w-full"
          />
          <p className="t-small mt-4 max-w-measure text-muted">{category.blurb}</p>
        </div>

        {/* Two smaller details, offset */}
        <div className="flex flex-col gap-6 lg:col-span-5 lg:pt-10">
          <div className="sm:max-w-[78%]">
            <AssetSlot
              key={detail1.id}
              slot={detail1}
              sizes="(max-width: 1023px) 78vw, 28vw"
            />
          </div>
          <div className="sm:ml-auto sm:max-w-[62%]">
            <AssetSlot
              key={detail2.id}
              slot={detail2}
              sizes="(max-width: 1023px) 62vw, 22vw"
            />
          </div>
        </div>
      </div>

      {/* Specifications + Panatta note */}
      <div className="mt-12 grid grid-cols-1 gap-10 border-t border-hairline pt-8 md:grid-cols-12">
        <dl className="md:col-span-7">
          {category.specs.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between gap-4 border-b border-hairline py-3.5 last:border-b-0"
            >
              <dt className="t-label text-faint">{s.label}</dt>
              <dd className="t-small text-right text-heading">
                {s.value ?? <Pending label={`${category.label} ${s.label.toLowerCase()}`} />}
              </dd>
            </div>
          ))}
        </dl>

        {/* The one place a restrained red accent appears in the UI */}
        <div className="md:col-span-5">
          <div className="border-l-2 border-burgundy pl-4">
            <span className="t-label mb-2 block text-muted">Equipment range</span>
            <p className="t-small text-heading">
              The floor is built around the Panatta range, in its burgundy frame finish.
            </p>
            <p className="t-small mt-2 text-faint">
              Model names and specifications are listed once confirmed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
