'use client';

import { useId, useState } from 'react';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';

type HeightUnit = 'cm' | 'ftin';
type WeightUnit = 'kg' | 'lb';

interface Result {
  bmi: number;
  band: string;
}

const BANDS: { max: number; label: string }[] = [
  { max: 18.5, label: 'Under the healthy range' },
  { max: 25, label: 'Healthy range' },
  { max: 30, label: 'Above the healthy range' },
  { max: Infinity, label: 'Well above the healthy range' },
];

/**
 * BMI calculator — typographic, no decorative imagery.
 *
 * Validates before calculating, states its own limitation plainly, and the
 * result animates only as a short opacity/translate settle.
 */
export default function BmiCalculator() {
  const id = useId();

  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');

  const [cm, setCm] = useState('');
  const [ft, setFt] = useState('');
  const [inch, setInch] = useState('');
  const [weight, setWeight] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const calculate = () => {
    // --- Height to metres ---
    let metres: number;
    if (heightUnit === 'cm') {
      const v = parseFloat(cm);
      if (!Number.isFinite(v) || v < 80 || v > 250) {
        setResult(null);
        setError('Enter a height between 80 and 250 cm.');
        return;
      }
      metres = v / 100;
    } else {
      const f = parseFloat(ft);
      const i = inch.trim() === '' ? 0 : parseFloat(inch);
      if (!Number.isFinite(f) || f < 2 || f > 8) {
        setResult(null);
        setError('Enter a height between 2 and 8 feet.');
        return;
      }
      if (!Number.isFinite(i) || i < 0 || i >= 12) {
        setResult(null);
        setError('Inches must be between 0 and 11.');
        return;
      }
      metres = (f * 12 + i) * 0.0254;
    }

    // --- Weight to kilograms ---
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) {
      setResult(null);
      setError('Enter your weight.');
      return;
    }
    const kg = weightUnit === 'kg' ? w : w * 0.45359237;
    if (kg < 20 || kg > 400) {
      setResult(null);
      setError(
        weightUnit === 'kg'
          ? 'Enter a weight between 20 and 400 kg.'
          : 'Enter a weight between 44 and 880 lb.'
      );
      return;
    }

    const bmi = kg / (metres * metres);
    const band = BANDS.find((b) => bmi < b.max)?.label ?? BANDS[BANDS.length - 1].label;

    setError(null);
    setResult({ bmi, band });
  };

  const unitButton = (selected: boolean) =>
    `t-ui px-3 py-2 border transition-colors duration-300 ${
      selected
        ? 'border-heading bg-heading text-ink'
        : 'border-hairline-2 text-muted hover:border-heading/40 hover:text-heading'
    }`;

  return (
    <section
      id="bmi"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="bmi-heading"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-10 md:mb-12">
          <SectionHeading id="bmi-heading" className="t-h2 uppercase text-heading">
            Check your BMI.
          </SectionHeading>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          {/* Inputs */}
          <form
            className="md:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              calculate();
            }}
            noValidate
          >
            {/* Height */}
            <fieldset className="border-t border-hairline pt-5">
              <legend className="sr-only">Height</legend>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="t-label text-muted">Height</span>
                <div
                  role="group"
                  aria-label="Height unit"
                  className="flex gap-2"
                >
                  <button
                    type="button"
                    aria-pressed={heightUnit === 'cm'}
                    onClick={() => {
                      setHeightUnit('cm');
                      reset();
                    }}
                    className={unitButton(heightUnit === 'cm')}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    aria-pressed={heightUnit === 'ftin'}
                    onClick={() => {
                      setHeightUnit('ftin');
                      reset();
                    }}
                    className={unitButton(heightUnit === 'ftin')}
                  >
                    ft / in
                  </button>
                </div>
              </div>

              {heightUnit === 'cm' ? (
                <>
                  <label htmlFor={`${id}-cm`} className="sr-only">
                    Height in centimetres
                  </label>
                  <input
                    id={`${id}-cm`}
                    className="field nums"
                    type="number"
                    inputMode="decimal"
                    min={80}
                    max={250}
                    step="any"
                    placeholder="175"
                    value={cm}
                    aria-invalid={Boolean(error) && !result}
                    onChange={(e) => {
                      setCm(e.target.value);
                      reset();
                    }}
                  />
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${id}-ft`} className="t-label mb-1.5 block text-faint">
                      Feet
                    </label>
                    <input
                      id={`${id}-ft`}
                      className="field nums"
                      type="number"
                      inputMode="numeric"
                      min={2}
                      max={8}
                      placeholder="5"
                      value={ft}
                      onChange={(e) => {
                        setFt(e.target.value);
                        reset();
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${id}-in`} className="t-label mb-1.5 block text-faint">
                      Inches
                    </label>
                    <input
                      id={`${id}-in`}
                      className="field nums"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={11}
                      placeholder="9"
                      value={inch}
                      onChange={(e) => {
                        setInch(e.target.value);
                        reset();
                      }}
                    />
                  </div>
                </div>
              )}
            </fieldset>

            {/* Weight */}
            <fieldset className="mt-8 border-t border-hairline pt-5">
              <legend className="sr-only">Weight</legend>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="t-label text-muted">Weight</span>
                <div role="group" aria-label="Weight unit" className="flex gap-2">
                  <button
                    type="button"
                    aria-pressed={weightUnit === 'kg'}
                    onClick={() => {
                      setWeightUnit('kg');
                      reset();
                    }}
                    className={unitButton(weightUnit === 'kg')}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    aria-pressed={weightUnit === 'lb'}
                    onClick={() => {
                      setWeightUnit('lb');
                      reset();
                    }}
                    className={unitButton(weightUnit === 'lb')}
                  >
                    lb
                  </button>
                </div>
              </div>

              <label htmlFor={`${id}-weight`} className="sr-only">
                Weight in {weightUnit === 'kg' ? 'kilograms' : 'pounds'}
              </label>
              <input
                id={`${id}-weight`}
                className="field nums"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder={weightUnit === 'kg' ? '72' : '159'}
                value={weight}
                aria-invalid={Boolean(error) && !result}
                onChange={(e) => {
                  setWeight(e.target.value);
                  reset();
                }}
              />
            </fieldset>

            <button type="submit" className="btn-solid mt-8">
              Calculate
            </button>

            {/* Validation message — announced to assistive tech */}
            <p role="alert" aria-live="polite" className="t-small mt-4 text-burgundy">
              {error}
            </p>
          </form>

          {/* Result */}
          <div className="md:col-span-5">
            <div className="border-t border-hairline pt-5">
              <span className="t-label block text-muted">Your BMI</span>

              <div
                className="mt-4 transition-[opacity,transform] duration-500 ease-editorial"
                style={{
                  opacity: result ? 1 : 0.28,
                  transform: result ? 'translateY(0)' : 'translateY(6px)',
                }}
                aria-live="polite"
              >
                <p
                  className="nums text-heading"
                  style={{ fontSize: 'var(--fs-h2)', lineHeight: 1, letterSpacing: '-0.03em' }}
                >
                  {result ? result.bmi.toFixed(1) : '—'}
                </p>
                <p className="t-small mt-3 text-heading">
                  {result ? result.band : 'Enter your height and weight.'}
                </p>
              </div>
            </div>

            <p className="t-small mt-8 border-t border-hairline pt-5 text-faint">
              BMI is a general screening measure. It does not distinguish muscle from
              fat, and it is not a diagnosis. Use it alongside a proper assessment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
