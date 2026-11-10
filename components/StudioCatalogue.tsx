'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CATALOGUE_BRAND_TABS,
  CATALOGUE_CATEGORIES,
  CATALOGUE_ITEMS,
  type CatalogueBrand,
  type CatalogueCategory,
  type CatalogueItem,
} from '@/data/catalogue';
import { site, whatsappLink } from '@/config/site';

const INITIAL_VISIBLE_COUNT = 12;

const PANATTA_SPOTLIGHT_IDS = [
  'panatta-pendulum-squat',
  'panatta-multi-flight',
  'panatta-super-declined-press',
  'panatta-super-high-row',
] as const;

const PLATE_LOADED_SPOTLIGHT_IDS = [
  'panatta-super-incline-press',
  'rl-chest-press',
  'shua-leg-press-45',
  'rl-hack-squat',
] as const;

function pickByIds(ids: readonly string[]): CatalogueItem[] {
  return ids
    .map((id) => CATALOGUE_ITEMS.find((item) => item.id === id))
    .filter((item): item is CatalogueItem => Boolean(item));
}

export default function StudioCatalogue() {
  const [selectedBrand, setSelectedBrand] = useState<'All' | CatalogueBrand>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CatalogueCategory>('All');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeItem, setActiveItem] = useState<CatalogueItem | null>(null);

  const panattaSpotlight = useMemo(() => pickByIds(PANATTA_SPOTLIGHT_IDS), []);
  const plateLoadedSpotlight = useMemo(() => pickByIds(PLATE_LOADED_SPOTLIGHT_IDS), []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOGUE_ITEMS.filter((item) => {
      if (selectedBrand !== 'All' && item.brand !== selectedBrand) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (!q) return true;
      const hay =
        `${item.name} ${item.brand} ${item.series} ${item.model} ${item.category} ${item.loadingType} ${item.primaryZones.join(' ')} ${item.summary}`.toLowerCase();
      return hay.includes(q);
    });
  }, [selectedBrand, selectedCategory, query]);

  const isFiltered =
    selectedBrand !== 'All' || selectedCategory !== 'All' || query.trim().length > 0;

  const visibleItems = useMemo(() => {
    if (showAll || isFiltered) return filteredItems;
    const featured = filteredItems.filter((i) => i.featured);
    return featured.length > 0 ? featured : filteredItems.slice(0, INITIAL_VISIBLE_COUNT);
  }, [filteredItems, showAll, isFiltered]);

  const activeBrandMeta = useMemo(
    () => CATALOGUE_BRAND_TABS.find((t) => t.id === selectedBrand) ?? CATALOGUE_BRAND_TABS[0],
    [selectedBrand]
  );

  const categoryCounts = useMemo(() => {
    const base =
      selectedBrand === 'All'
        ? CATALOGUE_ITEMS
        : CATALOGUE_ITEMS.filter((i) => i.brand === selectedBrand);
    const counts: Record<string, number> = { All: base.length };
    for (const cat of CATALOGUE_CATEGORIES) {
      if (cat !== 'All') {
        counts[cat] = base.filter((i) => i.category === cat).length;
      }
    }
    return counts;
  }, [selectedBrand]);

  const jumpToFilter = (brand: 'All' | CatalogueBrand, category: 'All' | CatalogueCategory) => {
    setSelectedBrand(brand);
    setSelectedCategory(category);
    setQuery('');
    setShowAll(true);
    document.getElementById('full-equipment-floor')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const list = filteredItems.length > 0 ? filteredItems : CATALOGUE_ITEMS;
        const idx = list.findIndex((i) => i.id === activeItem.id);
        if (idx === -1) return;
        const nextIdx =
          e.key === 'ArrowRight'
            ? (idx + 1) % list.length
            : (idx - 1 + list.length) % list.length;
        setActiveItem(list[nextIdx]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeItem, filteredItems]);

  const activeIdx = activeItem ? filteredItems.findIndex((i) => i.id === activeItem.id) : -1;

  const stepModal = (dir: 1 | -1) => {
    if (!activeItem) return;
    const list = filteredItems.length > 0 ? filteredItems : CATALOGUE_ITEMS;
    const idx = list.findIndex((i) => i.id === activeItem.id);
    if (idx === -1) return;
    setActiveItem(list[(idx + dir + list.length) % list.length]);
  };

  return (
    <div className="bg-[#F7F5F0] text-[#171513]">
      {/* ========================================================================
          SECTION 1 · FEATURED SPOTLIGHTS FIRST (PANATTA & PLATE-LOADED)
      ======================================================================== */}
      <section
        id="featured-highlights"
        aria-labelledby="spotlights-heading"
        className="border-b border-[#181614]/12 bg-gradient-to-b from-[#FCFBF8] via-[#F7F5F0] to-[#F2EFE8]"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-14 lg:px-20 pt-14 pb-20 md:pt-20 md:pb-24">
          <div className="max-w-3xl pb-12 border-b border-[#181614]/12">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-[#6E675D]">
              <span className="h-px w-8 bg-[#8C2230] inline-block" aria-hidden="true" />
              <span>Vyomi Fitness Club · Equipment Showroom</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#9A7440]">Daylight Edition</span>
            </div>

            <h1
              id="spotlights-heading"
              className="mt-4 t-hero text-[#141210] font-normal tracking-[-0.025em] uppercase"
            >
              Fitness Catalogue.
            </h1>

            <p className="mt-4 t-body text-[#4E4942] leading-relaxed">
              Built around Italian Panatta biomechanical frames and heavy-gauge Plate-Loaded
              strength stations, alongside SHUA commercial selectorized and endurance lines.
            </p>
          </div>

          {/* 01 · PANATTA SPOTLIGHT + 02 · PLATE-LOADED SPOTLIGHT */}
          <div className="mt-14 space-y-16">
            {/* ---- 01 · Panatta Highlight ---- */}
            <div className="rounded-sm border border-[#181614]/12 bg-[#FFFFFF] p-6 sm:p-8 lg:p-10 shadow-[0_12px_40px_rgba(24,20,16,0.05)]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#181614]/10">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#8C2230]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8C2230]" aria-hidden="true" />
                    01 · Highlight Pillar · Italian Engineering
                  </span>
                  <h2 className="mt-3 t-h2 text-[#141210] font-normal tracking-[-0.02em]">
                    Panatta Signature Series.
                  </h2>
                  <p className="mt-3 t-small text-[#565048] leading-relaxed">
                    Physiological joint curves milled in Apiro, Italy — spotlighting the Super
                    Pendulum Squat (1FW080), Standing Multi Flight (1FE028), Super Declined Press,
                    and Super High Row.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => jumpToFilter('Panatta', 'All')}
                  className="shrink-0 px-5 py-2.5 border border-[#8C2230] text-[#8C2230] hover:bg-[#8C2230] hover:text-white font-mono text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer"
                >
                  Browse All 17 Panatta ↓
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {panattaSpotlight.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItem(item)}
                    className="group text-left border border-[#181614]/12 bg-[#FAF8F4] hover:border-[#8C2230]/55 hover:shadow-[0_10px_28px_rgba(140,34,48,0.08)] transition-all overflow-hidden flex flex-col cursor-pointer"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE5]">
                      <img
                        src={item.image}
                        alt={`${item.brand} ${item.name} — ${item.model}`}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-4 border-t border-[#181614]/10 bg-white flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8C2230]">
                          Panatta · {item.model}
                        </span>
                        <h3 className="mt-1 text-base font-medium text-[#141210] leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] text-[#756E63] group-hover:text-[#141210] transition-colors">
                        Inspect station →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ---- 02 · Plate-Loaded Highlight ---- */}
            <div className="rounded-sm border border-[#181614]/12 bg-[#FFFFFF] p-6 sm:p-8 lg:p-10 shadow-[0_12px_40px_rgba(24,20,16,0.05)]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#181614]/10">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9A7440]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9A7440]" aria-hidden="true" />
                    02 · Highlight Pillar · Pure Resistance
                  </span>
                  <h2 className="mt-3 t-h2 text-[#141210] font-normal tracking-[-0.02em]">
                    Plate-Loaded Heavy Iron.
                  </h2>
                  <p className="mt-3 t-small text-[#565048] leading-relaxed">
                    Independent converging lever arms, 45° linear sleds, and Olympic loading pegs
                    across Panatta FreeWeight HP, Realleader HS Series, and SHUA heavy frames.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => jumpToFilter('All', 'Plate-Loaded')}
                  className="shrink-0 px-5 py-2.5 border border-[#141210] text-[#141210] hover:bg-[#141210] hover:text-white font-mono text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer"
                >
                  Filter Plate-Loaded ↓
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {plateLoadedSpotlight.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItem(item)}
                    className="group text-left border border-[#181614]/12 bg-[#FAF8F4] hover:border-[#9A7440] hover:shadow-[0_10px_28px_rgba(154,116,64,0.10)] transition-all overflow-hidden flex flex-col cursor-pointer"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE5]">
                      <img
                        src={item.image}
                        alt={`${item.brand} ${item.name} — ${item.model}`}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-4 border-t border-[#181614]/10 bg-white flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A7440]">
                          {item.brand} · {item.model}
                        </span>
                        <h3 className="mt-1 text-base font-medium text-[#141210] leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] text-[#756E63] group-hover:text-[#141210] transition-colors">
                        Inspect station →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          SECTION 2 · COMPLETE INTERACTIVE FLOOR CATALOGUE (NORMAL AS BEFORE)
      ======================================================================== */}
      <section
        id="full-equipment-floor"
        aria-labelledby="catalogue-heading"
        className="scroll-mt-12 bg-[#F4F1EA]"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-14 lg:px-20 py-20 md:py-28">
          {/* Header + Search */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[#181614]/12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.22em] text-[#6E675D]">
                <span className="h-px w-8 bg-[#8C2230] inline-block" aria-hidden="true" />
                <span>Complete Floor Index</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9A7440]">SHUA · Panatta · Realleader</span>
              </div>
              <h2
                id="catalogue-heading"
                className="mt-4 t-h2 text-[#141210] font-normal tracking-[-0.02em]"
              >
                All 46 Strength &amp; Cardio Stations.
              </h2>
              <p className="mt-4 t-body text-[#4E4942] leading-relaxed">
                Explore every machine by manufacturer, loading resistance type, or muscle target.
              </p>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <label htmlFor="catalogue-search" className="sr-only">
                Search equipment catalogue
              </label>
              <div className="relative">
                <input
                  id="catalogue-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search machine, brand, or model..."
                  className="w-full bg-white border border-[#181614]/15 focus:border-[#8C2230] px-4 py-3 text-sm text-[#141210] placeholder:text-[#8A8276] outline-none transition-colors shadow-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-wider text-[#756E63] hover:text-[#141210] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Brand & Zone Filters */}
          <div className="mt-8 flex flex-col gap-5">
            <div
              role="tablist"
              aria-label="Filter equipment by manufacturer"
              className="flex flex-wrap items-center gap-2"
            >
              {CATALOGUE_BRAND_TABS.map((tab) => {
                const active = selectedBrand === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSelectedBrand(tab.id);
                      setShowAll(true);
                    }}
                    className={`px-4 py-2.5 text-xs font-mono uppercase tracking-[0.16em] border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#141210] text-white border-[#141210] font-medium'
                        : 'bg-white text-[#4E4942] border-[#181614]/15 hover:border-[#141210]/45 hover:text-[#141210]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-y border-[#181614]/12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#756E63] mr-2">
                  Zone:
                </span>
                {CATALOGUE_CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat] ?? 0;
                  const active = selectedCategory === cat;
                  if (cat !== 'All' && count === 0) return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 text-[11px] font-mono uppercase tracking-[0.14em] transition-colors border cursor-pointer ${
                        active
                          ? 'border-[#8C2230] bg-[#8C2230]/10 text-[#8C2230] font-medium'
                          : 'border-transparent text-[#6B645A] hover:text-[#141210] hover:border-[#181614]/15'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              <p className="font-mono text-xs text-[#6B645A]">
                Showing <span className="text-[#141210] font-medium nums">{visibleItems.length}</span>{' '}
                of <span className="text-[#141210] font-medium nums">{filteredItems.length}</span>{' '}
                stations
              </p>
            </div>

            <p className="text-sm text-[#4E4942]">{activeBrandMeta.subtitle}</p>
          </div>

          {/* Grid */}
          {visibleItems.length === 0 ? (
            <div className="mt-12 border border-[#181614]/12 bg-white p-12 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#756E63]">
                No matching equipment
              </p>
              <p className="mt-2 t-body text-[#4E4942]">
                No stations matched &ldquo;{query}&rdquo; under the current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('All');
                  setSelectedCategory('All');
                  setQuery('');
                }}
                className="mt-6 px-5 py-2 border border-[#141210] text-[#141210] hover:bg-[#141210] hover:text-white font-mono text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer"
              >
                Reset Catalogue Filters
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className="group relative border border-[#181614]/12 bg-white hover:border-[#181614]/35 hover:shadow-[0_14px_34px_rgba(24,20,16,0.08)] transition-all flex flex-col overflow-hidden"
                >
                  <div
                    className="h-[2px] w-0 group-hover:w-full bg-[#8C2230] transition-all duration-300"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    onClick={() => setActiveItem(item)}
                    className="text-left flex flex-col flex-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8C2230] cursor-pointer"
                    aria-label={`Inspect ${item.brand} ${item.name}`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE5]">
                      <img
                        src={item.image}
                        alt={`${item.brand} ${item.name} — ${item.model}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4 border-t border-[#181614]/10 bg-white">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.16em]">
                          <span className="text-[#9A7440] font-medium">{item.brand}</span>
                          <span className="text-[#787064]">{item.catalogRef}</span>
                        </div>

                        <h3 className="mt-2 t-h3 text-[#141210] font-normal tracking-[-0.01em]">
                          {item.name}
                        </h3>

                        <p className="mt-1.5 text-xs text-[#575148] line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#181614]/10 flex items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="text-[#787064] truncate">
                          Model: <span className="text-[#141210] font-medium">{item.model}</span>
                        </span>
                        <span className="text-[#4E4942] group-hover:text-[#8C2230] inline-flex items-center gap-1 shrink-0 transition-colors">
                          Inspect <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}

          {/* Expand / Collapse */}
          {!isFiltered && filteredItems.length > INITIAL_VISIBLE_COUNT && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="px-7 py-3 border border-[#141210] text-[#141210] hover:bg-[#141210] hover:text-white font-mono text-xs uppercase tracking-[0.18em] inline-flex items-center gap-3 transition-colors cursor-pointer"
              >
                <span>
                  {showAll
                    ? `Show Featured ${INITIAL_VISIBLE_COUNT} Stations`
                    : `Explore Complete Floor (${filteredItems.length} Machines)`}
                </span>
                <span aria-hidden="true">{showAll ? '↑' : '↓'}</span>
              </button>
            </div>
          )}

          {/* Authentic Manufacturer Attribution Note & Booking CTA */}
          <div className="mt-14 pt-8 border-t border-[#181614]/12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-xs font-mono text-[#6E675D] max-w-2xl leading-relaxed">
              Catalogue source: Vyomi Fitness Club Vijayawada — SHUA, Panatta &amp; Realleader
              floor range. Model numbers and technical specifications are shown where supplied;
              manufacturer series codes reflect verified OEM hardware.
            </p>
            {(() => {
              const tourHref = whatsappLink(
                'Hi Vyomi Fitness Club team, I would like to book a floor tour at Patamata (Sonovision, 4th Floor) and learn more about the strength & cardio equipment.'
              );
              return tourHref ? (
                <a
                  href={tourHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#141210] hover:bg-[#8C2230] text-white font-mono text-xs uppercase tracking-[0.16em] inline-flex items-center gap-2 shrink-0 transition-colors"
                >
                  <span>Book Equipment Walkthrough</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null;
            })()}
          </div>
        </div>
      </section>

      {/* ========================================================================
          LIGHTBOX INSPECTOR MODAL (LIGHT ARCHITECTURAL THEME)
      ======================================================================== */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalogue-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#141210]/70 backdrop-blur-md"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-[#FFFFFF] border border-[#181614]/15 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lg:col-span-7 bg-[#EFECE5] relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#181614]/10">
              <div className="w-full aspect-[4/3]">
                <img
                  src={activeItem.image}
                  alt={`${activeItem.brand} ${activeItem.name}`}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {activeIdx >= 0 && (
                <div className="absolute bottom-4 left-4 bg-white/95 border border-[#181614]/15 px-3 py-1 font-mono text-[11px] text-[#6E675D] shadow-sm">
                  <span className="text-[#141210] font-medium nums">
                    {String(activeIdx + 1).padStart(2, '0')}
                  </span>{' '}
                  / {String(filteredItems.length).padStart(2, '0')}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between gap-6 bg-white">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#9A7440] font-medium">
                    {activeItem.brand} · {activeItem.series}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    aria-label="Close equipment inspector"
                    className="h-8 w-8 border border-[#181614]/15 hover:border-[#141210] text-[#575148] hover:text-[#141210] font-mono text-xs flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <h3
                  id="catalogue-modal-title"
                  className="mt-4 t-h2 text-[#141210] font-normal tracking-[-0.02em]"
                >
                  {activeItem.name}
                </h3>

                <p className="mt-4 t-small text-[#4E4942] leading-relaxed">
                  {activeItem.summary}
                </p>

                <dl className="mt-6 border-t border-[#181614]/12 divide-y divide-[#181614]/12 text-xs font-mono">
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-[#787064] uppercase tracking-wider">Model Ref</dt>
                    <dd className="text-[#141210] font-medium text-right">{activeItem.model}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-[#787064] uppercase tracking-wider">Catalogue Entry</dt>
                    <dd className="text-[#141210] text-right">{activeItem.catalogRef}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-[#787064] uppercase tracking-wider">Zone / Category</dt>
                    <dd className="text-[#141210] text-right">{activeItem.category}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-[#787064] uppercase tracking-wider">Resistance Type</dt>
                    <dd className="text-[#141210] text-right">{activeItem.loadingType}</dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#787064]">
                    Primary Target Zones
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeItem.primaryZones.map((z) => (
                      <span
                        key={z}
                        className="px-2.5 py-1 bg-[#F4F1EA] border border-[#181614]/12 font-mono text-[11px] text-[#3F3A34]"
                      >
                        {z}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#181614]/12 flex flex-col gap-3">
                {(() => {
                  const loc = site.address?.line1 ?? site.city;
                  const inquiryHref = whatsappLink(
                    `Hi Vyomi Fitness Club (${loc}), I'd like details about membership access to the ${activeItem.brand} ${activeItem.name} (${activeItem.model}).`
                  );
                  return inquiryHref ? (
                    <a
                      href={inquiryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#8C2230] hover:bg-[#6E1A25] text-white font-mono text-xs uppercase tracking-[0.16em] text-center transition-colors"
                    >
                      Inquire About Floor &amp; Pre-Sale Access ↗
                    </a>
                  ) : null;
                })()}

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => stepModal(-1)}
                    className="flex-1 py-2 px-3 border border-[#181614]/15 hover:border-[#141210] font-mono text-[11px] uppercase tracking-wider text-[#4E4942] hover:text-[#141210] transition-colors cursor-pointer"
                  >
                    ← Prev Station
                  </button>
                  <button
                    type="button"
                    onClick={() => stepModal(1)}
                    className="flex-1 py-2 px-3 border border-[#181614]/15 hover:border-[#141210] font-mono text-[11px] uppercase tracking-wider text-[#4E4942] hover:text-[#141210] transition-colors cursor-pointer"
                  >
                    Next Station →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
