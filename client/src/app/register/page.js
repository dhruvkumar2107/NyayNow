import Register from "../../auth/Register";

export const metadata = {
    title: 'Create an Account',
    description: 'Register for NyayNow AI-assisted legal information and document workflows in India.',
    alternates: {
        canonical: 'https://nyaynow.in/register',
    },
    openGraph: {
        title: 'Create an Account | NyayNow',
        description: 'Register for NyayNow AI-assisted legal information and document workflows.',
        url: 'https://nyaynow.in/register',
    }
}

export default function RegisterPage() {
    return <Register />;
}
