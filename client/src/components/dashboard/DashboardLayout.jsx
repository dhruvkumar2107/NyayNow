export default function DashboardLayout({ leftSidebar, mainFeed, rightSidebar }) {
    return (
        <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text-muted)] selection:bg-[var(--gold)]/25 pt-24 pb-12 px-0 md:px-0">
            <div className="relative z-10 max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">

                {/* LEFT SIDEBAR - PROFILE (1 col) */}
                <aside className="md:col-span-1 space-y-6">
                    <div className="sticky top-24">
                        {leftSidebar}
                    </div>
                </aside>

                {/* CENTER FEED - MAIN CONTENT (2 cols) */}
                <main className="md:col-span-2 space-y-6">
                    {mainFeed}
                </main>

                {/* RIGHT SIDEBAR - EXTRAS (1 col) */}
                <aside className="md:col-span-1 space-y-6 md:block order-last md:order-none">
                    <div className="sticky top-24">
                        {rightSidebar}
                    </div>
                </aside>

            </div>
        </div>
    );
}
