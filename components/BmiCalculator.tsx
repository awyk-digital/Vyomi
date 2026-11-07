'use client';

import { useState, useMemo } from 'react';

export default function BmiCalculator() {
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const [heightVal, setHeightVal] = useState<number>(178);
  const [weightVal, setWeightVal] = useState<number>(75);

  const { bmi, category, percentOnScale } = useMemo(() => {
    let heightInMeters = heightVal / 100;
    if (heightUnit === 'ft') {
      heightInMeters = heightVal * 0.3048;
    }

    let weightInKg = weightVal;
    if (weightUnit === 'lb') {
      weightInKg = weightVal * 0.453592;
    }

    if (heightInMeters <= 0 || weightInKg <= 0) {
      return { bmi: 0, category: 'Calculating', percentOnScale: 0 };
    }

    const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
    const clampedBmi = Math.min(Math.max(calculatedBmi, 15), 40);

    let cat = 'Optimal baseline';
    if (calculatedBmi < 18.5) cat = 'Low baseline';
    else if (calculatedBmi >= 25 && calculatedBmi < 30) cat = 'Elevated baseline';
    else if (calculatedBmi >= 30) cat = 'High baseline';

    const percent = ((clampedBmi - 15) / (40 - 15)) * 100;

    return {
      bmi: Number(calculatedBmi.toFixed(1)),
      category: cat,
      percentOnScale: Math.max(0, Math.min(100, percent)),
    };
  }, [heightVal, weightVal, heightUnit, weightUnit]);

  return (
    <section className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-20 px-[var(--pad-x)]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <span className="type-label block text-[var(--bone-dim)] mb-3 tracking-[0.22em]">
            Assessment
          </span>
          <h2 className="font-display text-2 font-light text-[var(--bone)] mb-4 leading-tight">
            Every programme starts with a number.
          </h2>
          <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed">
            An initial baseline for discussion with your coach before conducting detailed bioimpedance analysis.
          </p>
        </div>

        {/* Right Column: Instrument */}
        <div className="lg:col-span-7 flex flex-col space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Height */}
            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="type-label text-[var(--bone-dim)]">Height</span>
                <div className="flex items-center space-x-1.5 text-label text-[0.65rem]">
                  <button
                    type="button"
                    onClick={() => {
                      if (heightUnit !== 'cm') {
                        setHeightUnit('cm');
                        setHeightVal(Math.round(heightVal * 30.48));
                      }
                    }}
                    className={heightUnit === 'cm' ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)] opacity-40'}
                  >
                    cm
                  </button>
                  <span className="opacity-30">/</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (heightUnit !== 'ft') {
                        setHeightUnit('ft');
                        setHeightVal(Number((heightVal / 30.48).toFixed(1)));
                      }
                    }}
                    className={heightUnit === 'ft' ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)] opacity-40'}
                  >
                    ft
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={heightVal || ''}
                onChange={(e) => setHeightVal(Number(e.target.value))}
                className="w-full bg-transparent font-display text-2 font-light text-[var(--bone)] tabular-nums focus:outline-none"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="type-label text-[var(--bone-dim)]">Weight</span>
                <div className="flex items-center space-x-1.5 text-label text-[0.65rem]">
                  <button
                    type="button"
                    onClick={() => {
                      if (weightUnit !== 'kg') {
                        setWeightUnit('kg');
                        setWeightVal(Math.round(weightVal * 0.453592));
                      }
                    }}
                    className={weightUnit === 'kg' ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)] opacity-40'}
                  >
                    kg
                  </button>
                  <span className="opacity-30">/</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (weightUnit !== 'lb') {
                        setWeightUnit('lb');
                        setWeightVal(Math.round(weightVal * 2.20462));
                      }
                    }}
                    className={weightUnit === 'lb' ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)] opacity-40'}
                  >
                    lb
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={weightVal || ''}
                onChange={(e) => setWeightVal(Number(e.target.value))}
                className="w-full bg-transparent font-display text-2 font-light text-[var(--bone)] tabular-nums focus:outline-none"
              />
            </div>
          </div>

          {/* Result */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="type-label text-[var(--bone-dim)] block mb-1">Calculated index</span>
                <span className="font-display text-3 font-light text-[var(--bone)] tabular-nums">
                  {bmi || '--'}
                </span>
              </div>
              <span className="type-label text-[var(--champagne)] font-mono text-[0.68rem]">
                {category}
              </span>
            </div>

            {/* Slider track */}
            <div className="relative w-full pt-4 pb-2">
              <div className="relative h-px w-full bg-[var(--hairline)]">
                <div
                  className="absolute -top-[4px] h-2.5 w-px bg-[var(--champagne)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ left: `${percentOnScale}%` }}
                />
              </div>
              <div className="flex justify-between text-label text-[0.62rem] text-[var(--bone-dim)] font-mono mt-2">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30+</span>
                <span>40</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--hairline)] pt-4 flex items-center justify-between">
            <span className="type-body text-step--1 text-[var(--bone-dim)]">
              Multi-frequency scan available with our coaches.
            </span>
            <a
              href={`https://wa.me/919999999999?text=Hi%20Vyomi%20%E2%80%94%20I'd%20like%20to%20discuss%20a%20body%20scan%20with%20a%20coach.%20My%20baseline%20BMI%20is%20${bmi}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label text-[0.68rem] text-[var(--bone)] hover:text-[var(--champagne)] transition-colors inline-flex items-center space-x-1"
            >
              <span>Book consultation</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
