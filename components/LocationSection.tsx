'use client';

export default function LocationSection() {
  const scheduleDays = [
    { day: 'Monday', time: '05:30 — 22:30', isToday: true },
    { day: 'Tuesday', time: '05:30 — 22:30', isToday: false },
    { day: 'Wednesday', time: '05:30 — 22:30', isToday: false },
    { day: 'Thursday', time: '05:30 — 22:30', isToday: false },
    { day: 'Friday', time: '05:30 — 22:30', isToday: false },
    { day: 'Saturday', time: '06:00 — 22:00', isToday: false },
    { day: 'Sunday', time: '07:00 — 20:00', isToday: false },
  ];

  return (
    <section className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-20 px-[var(--pad-x)]">
      <div className="max-w-6xl mx-auto">
        <div className="border-b border-[var(--hairline)] pb-6 mb-12 flex items-end justify-between">
          <h2 className="font-display text-3 font-light text-[var(--bone)]">
            Find us.
          </h2>
          <span className="type-label font-mono text-[0.68rem] text-[var(--bone-dim)]">
            Vijayawada
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <span className="type-label text-[var(--bone-dim)] block mb-2">Location</span>
              <address className="not-italic type-body text-0 text-[var(--bone)] font-light leading-relaxed">
                Level 4, The Monolith Towers
                <br />
                MG Road, Near Benz Circle
                <br />
                Vijayawada, Andhra Pradesh 520010
              </address>
            </div>

            <div className="border border-[var(--hairline)] p-5 bg-[var(--surface)] rounded-[2px]">
              <span className="type-label text-[var(--champagne)] block mb-3">Sanctuary hours</span>
              <div className="flex flex-col space-y-2">
                {scheduleDays.map((item) => (
                  <div
                    key={item.day}
                    className="flex justify-between items-center text-label text-[0.68rem]"
                  >
                    <span className={item.isToday ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)]'}>
                      {item.day} {item.isToday && '· Today'}
                    </span>
                    <span className={`tabular-nums font-mono ${item.isToday ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)]'}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-1 text-label text-[0.68rem]">
              <div className="flex space-x-2">
                <span className="text-[var(--bone-dim)]">Phone:</span>
                <a href="tel:+919999999999" className="text-[var(--bone)] hover:text-[var(--champagne)]">
                  +91 99999 99999
                </a>
              </div>
              <div className="flex space-x-2">
                <span className="text-[var(--bone-dim)]">Email:</span>
                <a href="mailto:concierge@vyomifitness.com" className="text-[var(--bone)] hover:text-[var(--champagne)]">
                  concierge@vyomifitness.com
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden border border-[var(--hairline)] bg-[var(--surface)] rounded-[2px]">
              <iframe
                title="Vyomi Fitness Club Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61204.60670868128!2d80.60946059600021!3d16.506174304859067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9f3a52597%3A0x6b6c0e86b240ff80!2sVijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'grayscale(1) invert(0.92) contrast(1.1) brightness(0.75)',
                }}
                loading="lazy"
              />
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-[var(--champagne)] border border-[var(--ink)]" />
              </div>
            </div>

            <div className="flex space-x-6 text-label text-[0.68rem]">
              <a
                href="https://maps.google.com/?q=Vijayawada"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--bone-dim)] hover:text-[var(--bone)]"
              >
                Open in maps ↗
              </a>
              <a
                href="https://maps.google.com/?daddr=Vijayawada"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--bone-dim)] hover:text-[var(--bone)]"
              >
                Get directions ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
