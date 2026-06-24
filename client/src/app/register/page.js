import Register from "../../auth/Register";

export const metadata = {
    title: 'Create an Account',
    description: 'Register for a NyayNow account to consult verified advocates, draft legal documents, and access AI-powered legal assistance in India.',
    alternates: {
        canonical: 'https://nyaynow.in/register',
    },
    openGraph: {
        title: 'Create an Account | NyayNow',
        description: 'Register for a NyayNow account to consult verified advocates and access AI-powered legal assistance.',
        url: 'https://nyaynow.in/register',
    }
}

export default function RegisterPage() {
    return <Register />;
}
