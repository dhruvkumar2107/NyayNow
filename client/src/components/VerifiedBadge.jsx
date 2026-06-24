import React from "react";

export default function VerifiedBadge({ plan, verified, verificationStatus }) {
    if (!verified && !verificationStatus) return null;
    if (plan === "silver") return null;

    const isDiamond = plan === "diamond";
    const isAdvocateVerified = verificationStatus === "verified";

    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isDiamond ? "bg-purple-100 text-purple-700 border-purple-200" : isAdvocateVerified ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
            <span>
                {isDiamond ? "💎 Elite Partner" : isAdvocateVerified ? "⚖️ Advocate Verified" : "🆔 Identity Verified"}
            </span>
        </div>
    );
}
