export default function DashboardLayout({ leftSidebar, mainFeed, rightSidebar }) {
    return (
        <div className="min-h-screen bg-white text-gray-900 pt-24 pb-12 px-0 md:px-0">
            <div className="max-w-[1128px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">

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
