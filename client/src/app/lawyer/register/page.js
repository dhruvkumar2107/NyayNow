import Register from "../../../auth/Register";

export const metadata = {
    title: 'Join as a Lawyer',
    description: 'Register for a NyayNow Lawyer account to manage consultations, interact with clients, and use AI ERP tools.',
    alternates: {
        canonical: 'https://nyaynow.in/lawyer/register',
    },
    openGraph: {
        title: 'Join as a Lawyer | NyayNow',
        description: 'Register for a NyayNow Lawyer account to manage consultations, interact with clients, and use AI ERP tools.',
        url: 'https://nyaynow.in/lawyer/register',
    }
}

export default function LawyerRegisterPage() {
    return <Register defaultRole="lawyer" />;
}
