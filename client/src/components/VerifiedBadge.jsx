import React from "react";

export default function VerifiedBadge({ plan }) {
    if (plan === "silver") return null;

    const isDiamond = plan === "diamond";

    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isDiamond ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
            <span>{isDiamond ? "💎 Elite Partner" : "✅ Verified"}</span>
        </div>
    );
}
