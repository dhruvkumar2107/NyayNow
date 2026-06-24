import Contact from "../../../legacy_ignore/pages/Contact";

export const metadata = {
    title: 'Contact Us | NyayNow',
    description: 'Get in touch with the NyayNow team for support, partnerships, or legal inquiries. We are here to help.',
    alternates: {
        canonical: 'https://nyaynow.in/contact',
    },
    openGraph: {
        title: 'Contact Us | NyayNow',
        description: 'Get in touch with the NyayNow team for support, partnerships, or legal inquiries.',
        url: 'https://nyaynow.in/contact',
    }
}

export default function ContactPage() {
    return <Contact />;
}
