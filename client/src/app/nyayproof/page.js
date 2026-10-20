import Link from 'next/link';
import { ShieldAlert, FileText } from 'lucide-react';
import NyayProofClient from './NyayProofClient';

export const metadata = {
  title: 'NyayProof - Section 63 BSA Certificate Draft | NyayNow',
  description:
    'Draft a Section 63 Bharatiya Sakshya Adhiniyam, 2023 certificate for electronic records. A template for advocate review - not a valid certificate.',
  alternates: { canonical: 'https://nyaynow.in/nyayproof' },
  openGraph: {
    title: 'NyayProof - Section 63 BSA Certificate Draft | NyayNow',
    description:
      'Prepare a Section 63 BSA certificate draft for electronic records, for review by a qualified advocate.',
    url: 'https://nyaynow.in/nyayproof',
    type: 'website',
  },
};

export default function NyayProofPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--warn)]">
            <ShieldAlert size={14} />
            LEGAL-REVIEW-REQUIRED
          </p>
          <h1 className="mi-display mt-3 text-3xl sm:text-4xl font-bold">
            NyayProof - Section 63 BSA Certificate
          </h1>
          <p className="mt-4 text-[var(--text-muted)] leading-7">
            For electronic records to be admissible, Section 63 of the Bharatiya Sakshya
            Adhiniyam, 2023 (which replaced Section 65B of the Indian Evidence Act, 1872)
            requires a certificate in the form prescribed in the Second Schedule. Use this
            tool to assemble a draft certificate, then have it reviewed and finalised by a
            qualified advocate.
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm text-[var(--text-muted)]">
            <FileText size={16} className="mt-0.5 shrink-0 text-[var(--gold)]" />
            <span>
              NyayNow does not certify, timestamp, or store evidence. This draft is a template
              only - not a valid certificate. Read the{' '}
              <Link href="/disclaimer" className="text-[var(--gold-soft)] underline">
                disclaimer
              </Link>
              .
            </span>
          </p>
        </header>

        <NyayProofClient />
      </div>
    </main>
  );
}
