import InvestorsPageClient from './InvestorsPageClient';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Investor information | NyayNow',
  description: 'Private diligence information and current product evidence for NyayNow.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function InvestorsPage() {
  return <InvestorsPageClient />;
}
