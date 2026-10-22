'use client'
import React, { Suspense } from 'react';
import DigiLockerMock from "../../../legacy_ignore/pages/DigiLockerMock";

export default function DigiLockerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center text-slate-500">Loading...</div>}>
            <DigiLockerMock />
        </Suspense>
    );
}
