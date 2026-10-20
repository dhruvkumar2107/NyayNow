import AboutUs from "../../../legacy_ignore/pages/AboutUs";

export const metadata = {
    title: 'About Us',
    description: 'NyayNow is building AI-assisted legal workflows for India. Source verification, evaluation, privacy controls, and provider details are still in development.',
    alternates: {
        canonical: 'https://nyaynow.in/about',
    },
    openGraph: {
        title: 'About Us | NyayNow',
        description: 'NyayNow is building AI-assisted legal workflows for India.',
        url: 'https://nyaynow.in/about',
    }
}

export default function AboutPage() {
    return <AboutUs />;
}
