'use client'

import DevilsAdvocate from "../../../legacy_ignore/pages/DevilsAdvocate";
import UpgradeGate from "../../components/UpgradeGate";

export default function DevilsAdvocatePage() {
    return (
        <div className="min-h-screen bg-[#020617] pt-20 px-4">
            <div className="max-w-4xl mx-auto">
                <UpgradeGate feature="devils-advocate">
                    <DevilsAdvocate />
                </UpgradeGate>
            </div>
        </div>
    );
}
