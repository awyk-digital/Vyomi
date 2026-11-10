'use client';

import { useEffect, useMemo, useState } from 'react';
import AccentRule from '@/components/AccentRule';
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

function isHighlightedStation(item: CatalogueItem): boolean {
  return item.brand === 'Panatta' || item.category === 'Plate-Loaded';
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
    <div className="bg-ink text-muted">
      {/* ========================================================================
          SECTION 1 · FEATURED HIGHLIGHTS FIRST (PANATTA & PLATE-LOADED)
      ======================================================================== */}
      <section
        id="featured-highlights"
        aria-labelledby="spotlights-heading"
        className="border-b border-hairline bg-ink"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-14 lg:px-20 pt-14 pb-20 md:pt-20 md:pb-24">
          {/* Page Intro */}
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-faint">
              <span className="h-px w-8 bg-burgundy inline-block" aria-hidden="true" />
              <span>Vyomi Fitness Club · Vijayawada</span>
              <span className="text-hairline-2">·</span>
              <span className="text-[#B08D57]">SHUA · Panatta · Realleader</span>
            </div>

            <h1
              id="spotlights-heading"
              className="mt-4 t-hero uppercase text-heading font-normal tracking-[-0.025em]"
            >
              Fitness Catalogue.
            </h1>

            <p className="mt-4 t-body text-muted leading-relaxed">
              Every machine in its architectural training bay — spotlighting our flagship Italian{' '}
              <span className="text-heading">Panatta</span> biomechanical range and heavy{' '}
              <span className="text-heading">Plate-Loaded</span> iron first, followed by the full
              46-station floor directory.
            </p>

            <div className="mt-8 max-w-shell">
              <AccentRule />
            </div>
          </div>

          {/* 01 · PANATTA HIGHLIGHT + 02 · PLATE-LOADED HIGHLIGHT */}
          <div className="mt-14 space-y-12">
            {/* ---- 01 · Panatta Highlighted Showcase ---- */}
            <div
              className="relative overflow-hidden border border-[#8C2230]/55 bg-charcoal p-6 sm:p-8 lg:p-10 shadow-[0_0_50px_rgba(140,34,48,0.12)]"
              style={{
                background:
                  'radial-gradient(ellipse at top right, rgba(140,34,48,0.14), rgba(20,20,20,0.98) 62%)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-hairline">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-[#8C2230]/60 bg-[#8C2230]/20 text-[11px] font-mono uppercase tracking-[0.2em] text-[#F5F5F2]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" aria-hidden="true" />
                    <span>Highlighted Series 01 · Italian Biomechanics</span>
                  </div>
                  <h2 className="mt-4 t-h2 text-heading font-normal tracking-[-0.02em]">
                    Panatta Signature Series.
                  </h2>
                  <p className="mt-3 t-small text-muted leading-relaxed">
                    Precision joint curves in Vyomi burgundy frames — featuring the Super Pendulum
                    Squat (1FW080), Standing Multi Flight (1FE028), Super Declined Chest Press,
                    and Super High Row.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => jumpToFilter('Panatta', 'All')}
                  className="btn-line shine shrink-0 !py-2.5 !px-5 font-mono text-xs uppercase tracking-[0.16em] border-[#8C2230] text-heading hover:bg-[#8C2230] cursor-pointer"
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
                    className="group relative text-left border border-[#8C2230]/45 bg-charcoal-2 hover:border-[#B08D57] transition-all overflow-hidden flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                      <img
                        src={item.image}
                        alt={`${item.brand} ${item.name} — ${item.model}`}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#080808]/85 border border-[#8C2230]/70 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F5F5F2]">
                        Highlighted
                      </span>
                    </div>
                    <div className="p-4 border-t border-hairline flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B08D57]">
                          Panatta · {item.model}
                        </span>
                        <h3 className="mt-1.5 text-base font-normal text-heading group-hover:text-white leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] text-faint group-hover:text-[#B08D57] transition-colors">
                        Inspect station →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ---- 02 · Plate-Loaded Highlighted Showcase ---- */}
            <div
              className="relative overflow-hidden border border-[#B08D57]/55 bg-charcoal p-6 sm:p-8 lg:p-10 shadow-[0_0_50px_rgba(176,141,87,0.10)]"
              style={{
                background:
                  'radial-gradient(ellipse at top right, rgba(176,141,87,0.12), rgba(20,20,20,0.98) 62%)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-hairline">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-[#B08D57]/60 bg-[#B08D57]/15 text-[11px] font-mono uppercase tracking-[0.2em] text-[#F5F5F2]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D6F55B]" aria-hidden="true" />
                    <span>Highlighted Series 02 · Iso-Lateral Iron</span>
                  </div>
                  <h2 className="mt-4 t-h2 text-heading font-normal tracking-[-0.02em]">
                    Plate-Loaded Series.
                  </h2>
                  <p className="mt-3 t-small text-muted leading-relaxed">
                    Free-plate loading across Panatta FreeWeight HP, Realleader HS heavy frames, and
                    SHUA linear 45° sleds — engineered for raw progressive overload.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => jumpToFilter('All', 'Plate-Loaded')}
                  className="btn-line shine shrink-0 !py-2.5 !px-5 font-mono text-xs uppercase tracking-[0.16em] border-[#B08D57] text-heading hover:bg-[#B08D57] hover:text-ink cursor-pointer"
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
                    className="group relative text-left border border-[#B08D57]/45 bg-charcoal-2 hover:border-[#D6F55B]/75 transition-all overflow-hidden flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                      <img
                        src={item.image}
                        alt={`${item.brand} ${item.name} — ${item.model}`}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#080808]/85 border border-[#B08D57]/70 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B08D57]">
                        Highlighted · Plate-Loaded
                      </span>
                    </div>
                    <div className="p-4 border-t border-hairline flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B08D57]">
                          {item.brand} · {item.model}
                        </span>
                        <h3 className="mt-1.5 text-base font-normal text-heading group-hover:text-white leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] text-faint group-hover:text-[#B08D57] transition-colors">
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
          SECTION 2 · COMPLETE INTERACTIVE FLOOR CATALOGUE
      ======================================================================== */}
      <section
        id="full-equipment-floor"
        aria-labelledby="catalogue-heading"
        className="scroll-mt-12 bg-ink border-b border-hairline"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-14 lg:px-20 py-20 md:py-28">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-hairline">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.22em] text-faint">
                <span className="h-px w-8 bg-burgundy inline-block" aria-hidden="true" />
                <span>Complete Floor Index</span>
                <span className="text-hairline-2">·</span>
                <span className="text-[#B08D57]">46 Architectural Bay Shots</span>
              </div>
              <h2
                id="catalogue-heading"
                className="mt-4 t-h2 text-heading font-normal tracking-[-0.02em]"
              >
                All Strength &amp; Cardio Stations.
              </h2>
              <p className="mt-4 t-body text-muted leading-relaxed">
                Panatta and Plate-Loaded stations are flagged with bronze/crimson accents across
                the full directory.
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
                  className="w-full bg-charcoal border border-hairline focus:border-[#B08D57] px-4 py-3 text-sm text-heading placeholder:text-faint outline-none transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-wider text-faint hover:text-heading cursor-pointer"
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
                        ? 'bg-heading text-ink border-heading font-medium'
                        : 'bg-charcoal text-muted border-hairline hover:border-hairline-2 hover:text-heading'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-y border-hairline">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint mr-2">
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
                          ? 'border-burgundy bg-[#8C2230]/15 text-heading'
                          : 'border-transparent text-faint hover:text-heading hover:border-hairline'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              <p className="font-mono text-xs text-faint">
                Showing <span className="text-heading nums">{visibleItems.length}</span> of{' '}
                <span className="text-heading nums">{filteredItems.length}</span> stations
              </p>
            </div>

            <p className="text-sm text-muted">{activeBrandMeta.subtitle}</p>
          </div>

          {/* Grid */}
          {visibleItems.length === 0 ? (
            <div className="mt-12 border border-hairline bg-charcoal p-12 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">
                No matching equipment
              </p>
              <p className="mt-2 t-body text-muted">
                No stations matched &ldquo;{query}&rdquo; under the current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('All');
                  setSelectedCategory('All');
                  setQuery('');
                }}
                className="mt-6 btn-line !py-2 !px-5 font-mono text-xs uppercase tracking-[0.16em] cursor-pointer"
              >
                Reset Catalogue Filters
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item) => {
                const highlighted = isHighlightedStation(item);
                const isPanatta = item.brand === 'Panatta';
                return (
                  <article
                    key={item.id}
                    className={`group relative border transition-all flex flex-col overflow-hidden bg-charcoal ${
                      isPanatta
                        ? 'border-[#8C2230]/55 hover:border-[#8C2230]'
                        : highlighted
                        ? 'border-[#B08D57]/45 hover:border-[#B08D57]'
                        : 'border-hairline hover:border-hairline-2'
                    }`}
                  >
                    <div
                      className={`h-[2px] w-full transition-opacity duration-300 ${
                        isPanatta
                          ? 'bg-burgundy opacity-90'
                          : highlighted
                          ? 'bg-[#B08D57] opacity-80'
                          : 'bg-burgundy opacity-0 group-hover:opacity-100'
                      }`}
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="text-left flex flex-col flex-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-burgundy cursor-pointer"
                      aria-label={`Inspect ${item.brand} ${item.name}`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                        <img
                          src={item.image}
                          alt={`${item.brand} ${item.name} — ${item.model}`}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {highlighted && (
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-0.5 bg-[#080808]/85 border font-mono text-[10px] uppercase tracking-[0.16em] ${
                              isPanatta
                                ? 'border-[#8C2230]/80 text-[#F5F5F2]'
                                : 'border-[#B08D57]/80 text-[#B08D57]'
                            }`}
                          >
                            {isPanatta ? 'Panatta · Highlighted' : 'Plate-Loaded · Highlighted'}
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4 border-t border-hairline">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.16em]">
                            <span className="text-[#B08D57]">{item.brand}</span>
                            <span className="text-faint">{item.catalogRef}</span>
                          </div>

                          <h3 className="mt-2 t-h3 text-heading font-normal tracking-[-0.01em] group-hover:text-white transition-colors">
                            {item.name}
                          </h3>

                          <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-hairline flex items-center justify-between gap-2 text-[11px] font-mono">
                          <span className="text-faint truncate">
                            Model: <span className="text-heading">{item.model}</span>
                          </span>
                          <span className="text-muted group-hover:text-heading inline-flex items-center gap-1 shrink-0 transition-colors">
                            Inspect <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {!isFiltered && filteredItems.length > INITIAL_VISIBLE_COUNT && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="btn-line !py-3 !px-7 font-mono text-xs uppercase tracking-[0.18em] inline-flex items-center gap-3 hover:bg-hairline cursor-pointer"
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

          {/* Authentic PDF Footer Attribution Note & Booking CTA */}
          <div className="mt-14 pt-8 border-t border-hairline flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-xs font-mono text-faint max-w-2xl leading-relaxed">
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
                  className="btn-line !py-2.5 !px-5 font-mono text-xs uppercase tracking-[0.16em] inline-flex items-center gap-2 shrink-0 hover:bg-hairline"
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
          LIGHTBOX INSPECTOR MODAL (QUIET LUXURY DARK THEME)
      ======================================================================== */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalogue-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#080808]/90 backdrop-blur-md"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-charcoal border border-hairline-2 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lg:col-span-7 bg-ink relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-hairline">
              <div className="w-full aspect-[4/3]">
                <img
                  src={activeItem.image}
                  alt={`${activeItem.brand} ${activeItem.name}`}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {activeIdx >= 0 && (
                <div className="absolute bottom-4 left-4 bg-[#080808]/85 border border-hairline px-3 py-1 font-mono text-[11px] text-faint">
                  <span className="text-heading nums">
                    {String(activeIdx + 1).padStart(2, '0')}
                  </span>{' '}
                  / {String(filteredItems.length).padStart(2, '0')}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
                    {activeItem.brand} · {activeItem.series}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    aria-label="Close equipment inspector"
                    className="h-8 w-8 border border-hairline hover:border-hairline-2 text-muted hover:text-heading font-mono text-xs flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <h3
                  id="catalogue-modal-title"
                  className="mt-4 t-h2 text-heading font-normal tracking-[-0.02em]"
                >
                  {activeItem.name}
                </h3>

                <p className="mt-4 t-small text-muted leading-relaxed">
                  {activeItem.summary}
                </p>

                <dl className="mt-6 border-t border-hairline divide-y divide-hairline text-xs font-mono">
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-faint uppercase tracking-wider">Model Ref</dt>
                    <dd className="text-heading text-right">{activeItem.model}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-faint uppercase tracking-wider">Catalogue Entry</dt>
                    <dd className="text-heading text-right">{activeItem.catalogRef}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-faint uppercase tracking-wider">Zone / Category</dt>
                    <dd className="text-heading text-right">{activeItem.category}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-faint uppercase tracking-wider">Resistance Type</dt>
                    <dd className="text-heading text-right">{activeItem.loadingType}</dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-faint">
                    Primary Target Zones
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeItem.primaryZones.map((z) => (
                      <span
                        key={z}
                        className="px-2.5 py-1 bg-charcoal-2 border border-hairline font-mono text-[11px] text-muted"
                      >
                        {z}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline flex flex-col gap-3">
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
                      className="w-full py-3 px-4 bg-burgundy hover:bg-burgundy-dark text-white font-mono text-xs uppercase tracking-[0.16em] text-center transition-colors"
                    >
                      Inquire About Floor &amp; Pre-Sale Access ↗
                    </a>
                  ) : null;
                })()}

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => stepModal(-1)}
                    className="flex-1 py-2 px-3 border border-hairline hover:border-hairline-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-heading transition-colors cursor-pointer"
                  >
                    ← Prev Station
                  </button>
                  <button
                    type="button"
                    onClick={() => stepModal(1)}
                    className="flex-1 py-2 px-3 border border-hairline hover:border-hairline-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-heading transition-colors cursor-pointer"
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
