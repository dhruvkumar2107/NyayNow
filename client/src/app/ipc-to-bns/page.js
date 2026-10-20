import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import IpcToBnsClient from './IpcToBnsClient';
import { IPC_BNS_MAP, IPC_BNS_META } from '../../utils/ipcBnsData';

const BASE_URL = 'https://nyaynow.in';

export const metadata = {
  title: 'IPC to BNS Converter (India) - Section Mapping | NyayNow',
  description:
    'Search Indian Penal Code (IPC) section alignments with the Bharatiya Nyaya Sanhita (BNS), 2023. Reference seed data pending counsel review with links to the official India Code text.',
  alternates: { canonical: `${BASE_URL}/ipc-to-bns` },
  openGraph: {
    title: 'IPC to BNS Converter (India) | NyayNow',
    description:
      'Look up IPC to BNS section alignments, searchable by section number or offence, with official source links.',
    url: `${BASE_URL}/ipc-to-bns`,
    type: 'website',
  },
};

export default function IpcToBnsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'IPC to BNS section mapping',
    description: IPC_BNS_META.disclaimer,
    numberOfItems: IPC_BNS_MAP.items.length,
    itemListElement: IPC_BNS_MAP.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `IPC ${item.ipc} to BNS ${item.bns} - ${item.bnsTitle}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--warn)]">
            <ShieldAlert size={14} />
            Seed data - pending counsel review
          </p>
          <h1 className="mi-display mt-3 text-3xl sm:text-4xl font-bold text-[var(--text)]">
            IPC to BNS Converter
          </h1>
          <p className="mt-4 max-w-3xl text-[var(--text-muted)] leading-7">
            India replaced the Indian Penal Code, 1860 with the Bharatiya Nyaya Sanhita,
            2023. Use this searchable reference to find how a familiar IPC section aligns
            with the new BNS section. Every mapping here is a seed alignment that still
            requires review by a practising advocate.
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            This is legal information, not legal advice.{' '}
            <Link href="/disclaimer" className="text-[var(--gold-soft)] underline">
              Read the disclaimer
            </Link>
            .
          </p>
        </header>

        <IpcToBnsClient />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
