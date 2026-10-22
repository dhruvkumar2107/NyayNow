import Link from 'next/link';
import { Phone, Siren } from 'lucide-react';
import PressHoldSOS from '../../components/legal-sos/PressHoldSOS';

export const metadata = {
  title: 'Legal SOS - Emergency Legal Helplines India | NyayNow',
  description:
    'Press and hold to activate Legal SOS and reach national emergency and legal-aid helplines in India. Works offline with tap-to-dial numbers.',
  alternates: { canonical: 'https://nyaynow.in/legal-sos' },
  openGraph: {
    title: 'Legal SOS | NyayNow',
    description:
      'One press-and-hold SOS button with offline emergency and legal-aid helplines for India.',
    url: 'https://nyaynow.in/legal-sos',
    type: 'website',
  },
};

const HELPLINES = [
  { number: '112', label: 'National Emergency', detail: 'Police, fire and ambulance' },
  { number: '1091', label: 'Women Helpline', detail: '24x7 support for women in distress' },
  { number: '1098', label: 'Childline', detail: 'Children in need of care and protection' },
  { number: '15100', label: 'NALSA Legal Aid', detail: 'Free legal aid helpline' },
  { number: '1930', label: 'Cyber Crime', detail: 'Report online financial fraud' },
];

export default function LegalSOSPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--sos)]">
            <Siren size={14} />
            Emergency
          </p>
          <h1 className="mi-display mt-3 text-3xl sm:text-4xl font-bold">Legal SOS</h1>
          <p className="mt-4 text-[var(--text-muted)] leading-7">
            If you are in immediate danger, dial 112 now. Press and hold the button below
            to bring up the emergency helplines. The numbers work offline through your
            phone dialer.
          </p>
        </header>

        <div className="flex justify-center mb-12">
          <PressHoldSOS />
        </div>

        <section aria-labelledby="helplines-heading" className="space-y-3">
          <h2
            id="helplines-heading"
            className="text-sm uppercase tracking-widest text-[var(--text-muted)]"
          >
            Helplines
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {HELPLINES.map((line) => (
              <li key={line.number}>
                <a
                  href={`tel:${line.number}`}
                  className="mi-glass-card mi-tap mi-focus flex items-center gap-4 p-4 transition hover:brightness-110"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sos)_18%,transparent)] text-[var(--sos)]">
                    <Phone size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-bold text-[var(--text)]">
                      {line.number}
                    </span>
                    <span className="block text-sm text-[var(--text)]">{line.label}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{line.detail}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--text-muted)] pt-2">
            Helpline numbers are published public services and may change. Verify the
            current number if a call does not connect.{' '}
            <Link href="/disclaimer" className="text-[var(--gold-soft)] underline">
              Disclaimer
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
