import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* HERO SECTION */}
      <section className="bg-white pb-16 pt-12 border-b border-gray-300">
        <div className="max-w-[1128px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: TEXT */}
          <div className="space-y-6">
            <h1 className="text-5xl font-light text-gray-900 leading-[1.15]">
              Welcome to your professional legal community
            </h1>

            <div className="space-y-4">
              <FeatureRow text="Find a verified lawyer for your needs" />
              <FeatureRow text="Analyze legal agreements instantly with AI" />
              <FeatureRow text="Get 24/7 legal assistance in your language" />
            </div>

            {!user ? (
              <div className="flex gap-4 pt-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition shadow-sm"
                >
                  Join now
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-full bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 font-semibold text-lg transition"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="pt-4">
                <Link
                  to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                  className="inline-block px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition shadow-sm"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: ILLUSTRATION / HERO IMAGE */}
          <div className="relative">
            <div className="aspect-[4/3] bg-blue-50/50 rounded-xl border border-blue-100 p-8 relative overflow-hidden flex items-center justify-center">
              {/* Abstract UI Representation */}
              <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

              <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-5 space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100"></div>
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-gray-200 rounded"></div>
                    <div className="h-2 w-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded"></div>
                  <div className="h-2 w-full bg-gray-100 rounded"></div>
                  <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <div className="h-8 w-20 bg-blue-600 rounded-full"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 right-10 p-3 bg-white rounded-lg shadow-md border border-gray-100 animate-bounce delay-700">
                <span className="text-xl">⚖️</span>
              </div>
              <div className="absolute bottom-10 left-10 p-3 bg-white rounded-lg shadow-md border border-gray-100 animate-bounce">
                <span className="text-xl">📄</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-16">
        <div className="max-w-[1128px] mx-auto px-6">
          <h2 className="text-3xl font-light text-gray-800 mb-10">Explore what you can do</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              title="Find a Lawyer"
              desc="Search verified professionals by specialization and location."
              link="/marketplace"
              icon="🔍"
            />
            <Card
              title="Analyze Agreements"
              desc="Upload legal documents and get instant AI risk analysis."
              link="/agreements"
              icon="📄"
            />
            <Card
              title="Get Legal Help"
              desc="Ask our AI assistant any legal question in your language."
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
    <div className="flex items-center gap-4 group cursor-default">
      <span className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-300 group-hover:bg-gray-100 transition flex items-center justify-center text-gray-500">
        <span className="block w-2.5 h-2.5 rounded-sm bg-gray-400 group-hover:bg-blue-600 transition"></span>
      </span>
      <span className="text-xl text-gray-600 font-light group-hover:text-gray-900 transition">{text}</span>
    </div>
  )
}

function Card({ title, desc, link, icon }) {
  return (
    <Link to={link} className="block group">
      <div className="bg-white border border-gray-300 rounded-xl p-6 h-full hover:shadow-lg hover:border-blue-400 transition cursor-pointer relative top-0 hover:-top-1">
        <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition flex items-center gap-2">
          {title}
          <span className="opacity-0 group-hover:opacity-100 transition transform translate-x-0 group-hover:translate-x-1">→</span>
        </h3>
        <p className="text-gray-500 leading-relaxed font-light">{desc}</p>
      </div>
    </Link>
  )
}
