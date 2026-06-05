export const clientFeed = [
    {
        id: 1,
        type: "article",
        author: "Nyay-Sathi Legal Team",
        time: "2h ago",
        title: "Understanding Your Rights in Tenant Disputes",
        content: "Landlord harassment is easier to deal with when you know specific sections of the Rent Control Act...",
        likes: 42,
        comments: 12,
    },
    {
        id: 2,
        type: "update",
        author: "Supreme Court Updates",
        time: "5h ago",
        title: "New Ruling on Digital Privacy",
        content: "The apex court has mandated stricter data protection norms for fintech companies operating in India.",
        likes: 128,
        comments: 45,
    },
];

export const lawyerFeed = [
    {
        id: 101,
        type: "lead",
        client: "Anonymous User (Mumbai)",
        category: "Property Dispute",
        tier: "gold", // Requires Gold
        budget: "₹15k - ₹25k",
        description: "Seeking legal information/assistance for a property succession certificate. Family dispute involved.",
        time: "10m ago",
        title: "Property Succession Certificate",
        desc: "Seeking legal information/assistance for a property succession certificate. Family dispute involved.",
        location: "Mumbai",
        postedAt: new Date().toISOString()
    },
    {
        id: 102,
        type: "lead",
        client: "Small Business Owner (Pune)",
        category: "Contract Review",
        tier: "silver", // Accessible to Silver
        budget: "₹5k - ₹10k",
        description: "Need review of a vendor agreement before signing. Urgent requirement.",
        time: "45m ago",
        title: "Vendor Agreement Review",
        desc: "Need review of a vendor agreement before signing. Urgent requirement.",
        location: "Pune",
        postedAt: new Date().toISOString()
    },
    {
        id: 103,
        type: "lead",
        client: "Tech Startup (Bangalore)",
        category: "Criminal Defense",
        tier: "gold", // Criminal cases require Gold
        budget: "₹50k+",
        description: "Defending against a cybercrime allegation. Need High Court practitioner.",
        time: "1h ago",
        title: "Cybercrime Defense - High Court",
        desc: "Defending against a cybercrime allegation. Need High Court practitioner.",
        location: "Bangalore",
        postedAt: new Date().toISOString()
    },
];

export const suggestedLawyers = [
    { id: 1, name: "Adv. Priya Sharma", role: "Family Law", location: "Mumbai", specialization: "Family Law", tier: "silver", court: "District Court" },
    { id: 2, name: "Adv. Rajesh Verma", role: "Criminal Law", location: "Delhi", specialization: "Criminal Law", tier: "gold", court: "High Court" },
    { id: 3, name: "Adv. Anjali Gupta", role: "Corporate Law", location: "Bangalore", specialization: "Corporate Law", tier: "diamond", court: "Supreme Court" },
];

export const activeCases = [
    { id: 301, title: "Tenancy Agreement #2201", status: "Review Pending", acceptedBy: null },
    { id: 302, title: "Consultation with Adv. Mehta", status: "Scheduled", acceptedBy: "Adv. Mehta" },
];

export const CONTACTS = [
    { id: 1, name: "Adv. Priya Sharma", specialization: "Family Law", avatar: "P" },
    { id: 2, name: "Adv. Rajesh Verma", specialization: "Criminal Law", avatar: "R" },
    { id: 3, name: "Adv. Anjali Gupta", specialization: "Corporate Law", avatar: "A" }
];
