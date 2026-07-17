import Agreements from "../../../legacy_ignore/pages/Agreements";

export const metadata = {
    title: 'Evidence & Quantum Vault — Secure Document Escrow',
    description: 'Securely store and analyze litigation evidence using military-grade Post-Quantum Cryptography (PQC) encryption algorithms and deep-learning forensic scans.',
    alternates: {
        canonical: 'https://nyaynow.in/agreements',
    },
    openGraph: {
        title: 'Evidence & Quantum Vault — Secure Document Escrow | NyayNow',
        description: 'Securely store and analyze litigation evidence using military-grade Post-Quantum Cryptography (PQC) encryption algorithms and deep-learning forensic scans.',
        url: 'https://nyaynow.in/agreements',
    }
};

export default function AgreementsPage() {
    return <Agreements />;
}

