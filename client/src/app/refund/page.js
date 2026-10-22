import RefundPolicy from "../../components/RefundPolicy";

export const metadata = {
    title: 'Cancellation & Refund Policy',
    description: 'Read the NyayNow Cancellation and Refund Policy. Understand terms for subscription cancellations, refunds, and Razorpay billing.',
    alternates: {
        canonical: 'https://nyaynow.in/refund',
    },
    openGraph: {
        title: 'Cancellation & Refund Policy | NyayNow',
        description: 'Read the NyayNow Cancellation and Refund Policy.',
        url: 'https://nyaynow.in/refund',
    }
}

export default function RefundPage() {
    return <RefundPolicy />;
}
