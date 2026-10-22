'use client'

import JudgeProfile from "../../../legacy_ignore/pages/JudgeProfile";
import UpgradeGate from "../../components/UpgradeGate";

export default function JudgeProfilePage() {
    return (
        <div className="min-h-screen bg-[#020617] pt-20 px-4">
            <div className="max-w-4xl mx-auto">
                <UpgradeGate feature="judge-profile">
                    <JudgeProfile />
                </UpgradeGate>
            </div>
        </div>
    );
}
