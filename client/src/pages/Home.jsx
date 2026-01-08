import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-white pt-24 font-sans text-slate-900 selection:bg-blue-100">
      {/* HERO SECTION */}
      <section className="bg-white pb-20 pt-16 relative overflow-hidden">

        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[80px] opacity-60 -translate-x-1/2 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-[1128px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* LEFT: TEXT */}
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-6xl font-extrabold tracking-tight text-[#0B1120] leading-[1.1]">
              Legal Intelligence
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">for Everyone.</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-lg leading-relaxed">
              Instantly analyze agreements, draft notices, and connect with top lawyers. The professional legal companion for the modern era.
            </p>

            <div className="space-y-4">
              <FeatureRow text="Instant AI Agreement Analysis" />
              <FeatureRow text="Verified Supreme Court Lawyers" />
              <FeatureRow text="24/7 Multilingual Legal Assistant" />
            </div>

            {!user ? (
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-[#0B1120] hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transform hover:-translate-y-1"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl bg-white text-[#0B1120] border border-slate-200 font-bold text-lg transition hover:bg-slate-50 hover:border-slate-300"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="pt-4">
                <Link
                  to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                  className="inline-block px-8 py-4 rounded-xl bg-[#0B1120] hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-xl shadow-blue-900/10 transform hover:-translate-y-1"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}

            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider pt-4">Trusted by 10,000+ Individual & Corporate Users</p>
          </div>

          {/* RIGHT: ILLUSTRATION / HERO IMAGE */}
          <div className="relative animate-in slide-in-from-right duration-1000 delay-200">
            <div className="aspect-square bg-white rounded-3xl p-8 relative overflow-hidden flex items-center justify-center border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
              {/* Abstract UI Representation */}
              <div className="absolute inset-0 bg-slate-50/50"></div>

              <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 space-y-6 transform rotate-[-2deg] hover:rotate-0 transition duration-500">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
                    📄
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-slate-800 rounded-full"></div>
                    <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
                </div>
                <div className="pt-4 flex gap-3">
                  <div className="h-10 w-full bg-slate-900 rounded-lg"></div>
                  <div className="h-10 w-full bg-blue-50 rounded-lg border border-blue-100"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-12 right-12 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-bounce delay-700 z-20">
                <span className="text-3xl">⚖️</span>
              </div>
              <div className="absolute bottom-16 left-8 p-5 bg-[#0B1120] rounded-2xl shadow-xl animate-bounce z-20">
                <span className="text-3xl text-white">🛡️</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-24 bg-slate-50 relative border-t border-slate-200">
        <div className="max-w-[1128px] mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-[#0B1120] mb-4">Empowering Justice with Tech</h2>
            <p className="text-slate-600 text-lg">We combine cutting-edge AI with verified legal expertise to make justice accessible to everyone.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card
              title="Find a Lawyer"
              desc="Search verified Supreme Court and High Court advocates by specialization."
              link="/marketplace"
              icon="🔍"
            />
            <Card
              title="Analyze Agreements"
              desc="Upload contracts to detect risks, missing clauses, and ambiguities instantly."
              link="/agreements"
              icon="📄"
            />
            <Card
              title="AI Legal Assistant"
              desc="Get instant answers and draft legal notices in 10+ Indian languages."
              link="/assistant"
              icon="🤖"
            />
          </div>
        </div>
      </section>

    </main>
  );
}

function FeatureRow({ text }) {
  return (
    <div className="flex items-center gap-3 group cursor-default">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <span className="text-lg text-slate-700 font-semibold">{text}</span>
    </div>
  )
}

function Card({ title, desc, link, icon }) {
  return (
    <Link to={link} className="block group">
      <div className="bg-white rounded-3xl p-8 h-full shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 border border-slate-200 transition-all duration-300 relative top-0 hover:-top-2 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-blue-100"></div>

        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-6 relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
          {icon}
        </div>

        <h3 className="text-xl font-bold text-[#0B1120] mb-3 group-hover:text-blue-700 transition flex items-center gap-2 relative z-10">
          {title}
        </h3>

        <p className="text-slate-500 leading-relaxed text-base relative z-10 font-medium">{desc}</p>
      </div>
    </Link>
  )
}
