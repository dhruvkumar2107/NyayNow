import Login from "../../auth/Login";

export const metadata = {
    title: 'Sign In to Your Account',
    description: 'Sign in to access NyayNow legal information and document workflows. Verify sources and advocate credentials independently.',
    alternates: {
        canonical: 'https://nyaynow.in/login',
    },
    openGraph: {
        title: 'Sign In to Your Account | NyayNow',
        description: 'Sign in to access NyayNow legal information and document workflows.',
        url: 'https://nyaynow.in/login',
    }
}

export default function LoginPage() {
    return <Login />;
}
