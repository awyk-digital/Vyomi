'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AccentRule from '@/components/AccentRule';
import SectionHeading from '@/components/SectionHeading';
import {
  CATALOGUE_BRAND_TABS,
  CATALOGUE_CATEGORIES,
  CATALOGUE_ITEMS,
  type CatalogueBrand,
  type CatalogueCategory,
  type CatalogueItem,
} from '@/data/catalogue';
import { site, whatsappLink } from '@/config/site';
import { prefersReducedMotion } from '@/lib/motion';

const INITIAL_VISIBLE_COUNT = 12;

/** Uniform spotlight card geometry so all machines render at identical size and 4:3 aspect ratio */
const CARD_WIDTH = 420;
const CARD_GAP = 24; // mr-6
const STEP_DISTANCE = CARD_WIDTH + CARD_GAP;
const LOOP_SPEED = 24;

const PANATTA_SPOTLIGHT_IDS = [
  'panatta-pendulum-squat',
  'panatta-multi-flight',
  'panatta-super-declined-press',
  'panatta-super-high-row',
  'panatta-horizontal-multi-press',
  'panatta-leg-press-bridge',
] as const;

const PLATE_LOADED_SPOTLIGHT_IDS = [
  'panatta-super-incline-press',
  'rl-chest-press',
  'shua-leg-press-45',
  'rl-hack-squat',
  'panatta-dips-press',
  'rl-incline-press',
] as const;

function pickByIds(ids: readonly string[]): CatalogueItem[] {
  return ids
    .map((id) => CATALOGUE_ITEMS.find((item) => item.id === id))
    .filter((item): item is CatalogueItem => Boolean(item));
}

interface SpotlightStripProps {
  id: string;
  title: string;
  subtitle: string;
  items: CatalogueItem[];
  onInspect: (item: CatalogueItem) => void;
  onExploreCategory: () => void;
  exploreLabel: string;
}

/** Horizontal gliding staggered equipment rail matching ExploreGallery ("EXPLORE VYOMI.") */
function SpotlightStrip({
  id,
  title,
  subtitle,
  items,
  onInspect,
  onExploreCategory,
  exploreLabel,
}: SpotlightStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const offsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const lapRef = useRef(0);
  const isPausedRef = useRef(false);
  isPausedRef.current = paused;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      lapRef.current = track.scrollWidth / 2;
    };
    measure();

    let lastTime = performance.now();
    let rId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const lap = lapRef.current;
      if (lap > 0) {
        if (!isPausedRef.current && !prefersReducedMotion()) {
          targetOffsetRef.current += LOOP_SPEED * dt;
        }
        const diff = targetOffsetRef.current - offsetRef.current;
        offsetRef.current += diff * Math.min(dt * 7, 0.3);

        while (offsetRef.current >= lap) {
          offsetRef.current -= lap;
          targetOffsetRef.current -= lap;
        }
        while (offsetRef.current < 0) {
          offsetRef.current += lap;
          targetOffsetRef.current += lap;
        }

        track.style.transform = `translate3d(-${offsetRef.current.toFixed(2)}px, 0, 0)`;
      }
      rId = requestAnimationFrame(tick);
    };

    rId = requestAnimationFrame(tick);
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => {
      cancelAnimationFrame(rId);
      ro.disconnect();
    };
  }, [items.length]);

  const handlePrev = useCallback(() => {
    targetOffsetRef.current -= STEP_DISTANCE;
  }, []);

  const handleNext = useCallback(() => {
    targetOffsetRef.current += STEP_DISTANCE;
  }, []);

  const renderCards = (copy: number) =>
    items.map((item, i) => {
      return (
        <figure
          key={`${copy}-${item.id}`}
          className="mr-6 shrink-0 w-[min(82vw,420px)]"
        >
          <button
            type="button"
            onClick={() => onInspect(item)}
            className="group block w-full text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-burgundy cursor-pointer"
            aria-label={`Inspect ${item.brand} ${item.name}`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal">
              <img
                src={item.image}
                alt={`${item.brand} ${item.name} — ${item.model}`}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>

            <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="t-label nums text-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="t-small text-heading group-hover:text-white transition-colors">
                {item.name}
              </span>
              <span className="t-label text-[0.625rem] text-[#B08D57]">{item.model}</span>
            </figcaption>
          </button>
        </figure>
      );
    });

  return (
    <section id={id} className="border-t border-hairline bg-ink py-section-y">
      {/* Header matching EXPLORE VYOMI. */}
      <div className="mb-10 px-pad-x md:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <SectionHeading className="t-h2 uppercase text-heading" stagger={0.06}>
            {title}
          </SectionHeading>
          <p className="mt-3 t-small text-muted">{subtitle}</p>
          <div className="mt-6 max-w-shell">
            <AccentRule />
          </div>
        </div>

        {/* Navigation controls matching EXPLORE VYOMI. */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-end shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={`Previous ${title} machine`}
            className="group flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-[#141414]/80 backdrop-blur-md text-muted transition-all duration-300 hover:border-hairline-2 hover:bg-charcoal hover:text-heading active:scale-95 cursor-pointer"
          >
            <span className="text-sm transition-transform duration-300 group-hover:-translate-x-0.5">
              ←
            </span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label={`Next ${title} machine`}
            className="group flex h-9 items-center gap-2.5 rounded-full border border-hairline bg-[#141414]/80 px-4 backdrop-blur-md text-muted transition-all duration-300 hover:border-hairline-2 hover:bg-charcoal hover:text-heading active:scale-95 cursor-pointer"
          >
            <span className="t-label text-[0.625rem] text-faint group-hover:text-muted transition-colors">
              Explore
            </span>
            <span className="text-sm text-heading transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

          <button
            type="button"
            onClick={onExploreCategory}
            className="h-9 rounded-full border border-hairline-2 px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[#B08D57] hover:border-[#B08D57] hover:text-heading transition-colors cursor-pointer"
          >
            {exploreLabel} ↓
          </button>
        </div>
      </div>

      {/* Gliding Staggered Photo Strip */}
      <div
        className="relative overflow-hidden"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div ref={trackRef} className="marquee-track flex w-max will-change-transform">
          <div className="flex">{renderCards(0)}</div>
          <div className="flex" aria-hidden="true">
            {renderCards(1)}
          </div>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(2rem,8vw,7rem)]"
          style={{
            background: 'linear-gradient(to right, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(2rem,8vw,7rem)]"
          style={{
            background: 'linear-gradient(to left, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>
    </section>
  );
}

export default function StudioCatalogue() {
  const [selectedBrand, setSelectedBrand] = useState<'All' | CatalogueBrand>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CatalogueCategory>('All');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeItem, setActiveItem] = useState<CatalogueItem | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [panOrigin, setPanOrigin] = useState({ x: 50, y: 50 });

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

  const openInspector = useCallback((item: CatalogueItem) => {
    setZoomed(false);
    setPanOrigin({ x: 50, y: 50 });
    setActiveItem(item);
  }, []);

  useEffect(() => {
    if (!activeItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null);
        setZoomed(false);
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
        setZoomed(false);
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
    setZoomed(false);
    setActiveItem(list[(idx + dir + list.length) % list.length]);
  };

  return (
    <div className="bg-ink text-muted">
      {/* ========================================================================
          TITLE BAND
      ======================================================================== */}
      <section className="bg-ink px-pad-x pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-faint">
            <span className="h-px w-8 bg-burgundy inline-block" aria-hidden="true" />
            <span>Vyomi Fitness Club · Vijayawada</span>
            <span className="text-hairline-2">·</span>
            <span className="text-[#B08D57]">SHUA · Panatta · Realleader</span>
          </div>

          <h1 className="mt-4 t-hero uppercase text-heading font-normal tracking-[-0.025em]">
            Fitness Catalogue.
          </h1>

          <p className="mt-4 t-body text-muted leading-relaxed">
            Dedicated showroom featuring Italian Panatta Series and heavy Plate-Loaded frames
            first, followed by the complete 46-station commercial floor directory.
          </p>
        </div>
      </section>

      {/* ========================================================================
          HIGHLIGHT 01 · PANATTA (EXPLORE VYOMI STAGGERED RAIL STYLE)
      ======================================================================== */}
      <SpotlightStrip
        id="panatta-series"
        title="Panatta Series."
        subtitle="Italian FreeWeight & Fit Evo biomechanics in signature frames."
        items={panattaSpotlight}
        onInspect={openInspector}
        onExploreCategory={() => jumpToFilter('Panatta', 'All')}
        exploreLabel="View All 17"
      />

      {/* ========================================================================
          HIGHLIGHT 02 · PLATE-LOADED (EXPLORE VYOMI STAGGERED RAIL STYLE)
      ======================================================================== */}
      <SpotlightStrip
        id="plate-loaded-series"
        title="Plate-Loaded."
        subtitle="Converging iso-lateral arms and linear heavy iron sleds."
        items={plateLoadedSpotlight}
        onInspect={openInspector}
        onExploreCategory={() => jumpToFilter('All', 'Plate-Loaded')}
        exploreLabel="Filter Plate-Loaded"
      />

      {/* ========================================================================
          COMPLETE FLOOR DIRECTORY (CLEAN CARDS, ZERO "HIGHLIGHTED" TAGS)
      ======================================================================== */}
      <section
        id="full-equipment-floor"
        aria-labelledby="catalogue-heading"
        className="scroll-mt-12 bg-ink border-t border-hairline"
      >
        <div className="mx-auto max-w-[1440px] px-pad-x py-section-y">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-hairline">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.22em] text-faint">
                <span className="h-px w-8 bg-burgundy inline-block" aria-hidden="true" />
                <span>Complete Floor Directory</span>
                <span className="text-hairline-2">·</span>
                <span className="text-[#B08D57]">46 Equipment Stations</span>
              </div>
              <h2
                id="catalogue-heading"
                className="mt-4 t-h2 text-heading font-normal tracking-[-0.02em]"
              >
                All Strength &amp; Cardio Stations.
              </h2>
              <p className="mt-4 t-body text-muted leading-relaxed">
                Filter across manufacturers, loading architecture, or muscle focus — click any
                card to inspect in full 2.25× high-resolution detail.
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

          {/* Clean Equipment Grid (NO overlay badges) */}
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
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className="group relative border border-hairline bg-charcoal hover:border-hairline-2 transition-colors flex flex-col overflow-hidden"
                >
                  <div
                    className="h-[2px] w-0 group-hover:w-full bg-burgundy transition-all duration-300"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    onClick={() => openInspector(item)}
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
              ))}
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

          {/* Authentic Catalogue Note & Booking CTA */}
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
          HI-RES LIGHTBOX INSPECTOR WITH 2.25x OPTICAL ZOOM & PAN
      ======================================================================== */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalogue-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#080808]/90 backdrop-blur-md"
          onClick={() => {
            setZoomed(false);
            setActiveItem(null);
          }}
        >
          <div
            className="relative w-full max-w-5xl bg-charcoal border border-hairline-2 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Interactive Hi-Res 1600x1200 Zoom Viewport */}
            <div
              className={`lg:col-span-7 bg-ink relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-hairline overflow-hidden ${
                zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setZoomed((z) => !z)}
              onMouseMove={(e) => {
                if (!zoomed) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setPanOrigin({ x, y });
              }}
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src={activeItem.image}
                  alt={`${activeItem.brand} ${activeItem.name}`}
                  className="h-full w-full object-cover object-center transition-transform duration-200 ease-out"
                  style={{
                    transform: zoomed ? 'scale(2.25)' : 'scale(1)',
                    transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
                  }}
                />
              </div>

              {activeIdx >= 0 && (
                <div className="absolute bottom-4 left-4 bg-[#080808]/85 border border-hairline px-3 py-1 font-mono text-[11px] text-faint pointer-events-none">
                  <span className="text-heading nums">
                    {String(activeIdx + 1).padStart(2, '0')}
                  </span>{' '}
                  / {String(filteredItems.length).padStart(2, '0')}
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((z) => !z);
                }}
                className="absolute bottom-4 right-4 bg-[#080808]/85 hover:bg-charcoal border border-hairline-2 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-heading cursor-pointer"
              >
                {zoomed ? 'Reset Zoom 1×' : 'Zoom 2.25× +'}
              </button>
            </div>

            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
                    {activeItem.brand} · {activeItem.series}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setZoomed(false);
                      setActiveItem(null);
                    }}
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

                <p className="mt-4 t-small text-muted leading-relaxed">{activeItem.summary}</p>

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
