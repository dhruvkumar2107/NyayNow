import AboutUs from "../../../legacy_ignore/pages/AboutUs";

export const metadata = {
    title: 'About Us | NyayNow',
    description: 'Learn about NyayNow\'s mission to democratize legal intelligence through institutional-grade AI and connect citizens with top legal professionals in India.',
    alternates: {
        canonical: 'https://nyaynow.in/about',
    },
    openGraph: {
        title: 'About Us | NyayNow',
        description: 'Learn about NyayNow\'s mission to democratize legal intelligence through institutional-grade AI.',
        url: 'https://nyaynow.in/about',
    }
}

export default function AboutPage() {
    return <AboutUs />;
}
