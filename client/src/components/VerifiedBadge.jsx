import React from "react";

export default function VerifiedBadge({ plan, verified, verificationStatus }) {
    // Platform account/profile review is not a verification of advocate enrolment.
    if (!verified && !verificationStatus) return null;
    if (plan === "silver") return null;

    return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-blue-100 text-blue-700 border-blue-200">
            <span>
                Profile reviewed
            </span>
        </div>
    );
}
