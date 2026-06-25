import Login from "../../auth/Login";

export const metadata = {
    title: 'Sign In to Your Account',
    description: 'Sign in to access your NyayNow dashboard, consult verified advocates, predict case outcomes, and manage legal cases.',
    alternates: {
        canonical: 'https://nyaynow.in/login',
    },
    openGraph: {
        title: 'Sign In to Your Account | NyayNow',
        description: 'Sign in to access your NyayNow dashboard, consult verified advocates, and manage legal cases.',
        url: 'https://nyaynow.in/login',
    }
}

export default function LoginPage() {
    return <Login />;
}
