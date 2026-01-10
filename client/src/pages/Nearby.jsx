import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

/* -----------------------------------------
   MOCK DATA
----------------------------------------- */
const MOCK_NEARBY = {
  police_stations: [
    { name: "Andheri Police Station", distance: "1.2 km", address: "Andheri East, Mumbai", rating: "4.5" },
    { name: "Bandra Police Station", distance: "3.8 km", address: "Bandra West, Mumbai", rating: "4.2" },
    { name: "Juhu Police Station", distance: "5.1 km", address: "Juhu Tara Road, Mumbai", rating: "4.0" },
  ],
  courts: [
    { name: "Mumbai District Court", distance: "4.5 km", address: "Fort, Mumbai", rating: "4.8" },
    { name: "High Court of Bombay", distance: "7.1 km", address: "Mantralaya, Mumbai", rating: "4.9" },
  ],
  lawyers: [
    { id: 1, name: "Adv. Rahul Sharma", specialization: "Criminal Law", location: "Andheri East", plan: "diamond", distance: "1.5 km", rating: "5.0", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 2, name: "Adv. Neha Verma", specialization: "Corporate Law", location: "Bandra West", plan: "gold", distance: "2.8 km", rating: "4.9", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: 3, name: "Adv. Ankit Patel", specialization: "Family Law", location: "Juhu", plan: "silver", distance: "4.2 km", rating: "4.7", image: "https://randomuser.me/api/portraits/men/45.jpg" },
    { id: 4, name: "Adv. Priya Singh", specialization: "Civil Litigation", location: "Dadar", plan: "silver", distance: "6.0 km", rating: "4.6", image: "https://randomuser.me/api/portraits/women/65.jpg" },
  ],
};

export default function Nearby() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    // Simulate API Load
    setLoading(true);
    setTimeout(() => {
      setData(MOCK_NEARBY);
      setLoading(false);
    }, 1500);
  }, []);

  const categories = [
    { id: "all", label: "All Services", icon: "🗺️" },
    { id: "police", label: "Police", icon: "🚓" },
    { id: "courts", label: "Courts", icon: "⚖️" },
    { id: "lawyers", label: "Lawyers", icon: "👨‍⚖️" },
  ];

  return (
    <div className="flex h-[calc(100vh-72px)] bg-slate-50 overflow-hidden">

      {/* LEFT SIDEBAR - LISTINGS */}
      <aside className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">

        {/* HEADER & SEARCH */}
        <div className="p-6 border-b border-slate-100 bg-white z-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Nearby Support</h1>
          <p className="text-sm text-slate-500 mb-4">Find reliable legal help around you</p>

          <div className="relative">
            <input
              type="text"
              placeholder="Search for lawyers, courts..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
            />
            <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60 gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-medium">Scanning locations...</p>
            </div>
          ) : (
            <>
              {(selectedCategory === 'all' || selectedCategory === 'police') && (
                <Section title="Police Stations">
                  {data?.police_stations.map((p, i) => <PlaceCard key={i} data={p} type="police" />)}
                </Section>
              )}

              {(selectedCategory === 'all' || selectedCategory === 'courts') && (
                <Section title="Courts">
                  {data?.courts.map((c, i) => <PlaceCard key={i} data={c} type="court" />)}
                </Section>
              )}

              {(selectedCategory === 'all' || selectedCategory === 'lawyers') && (
                <Section title="Verified Lawyers">
                  {data?.lawyers.map((l, i) => <LawyerCard key={i} data={l} />)}
                </Section>
              )}
            </>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN - MAP PLACEHOLDER */}
      <main className="flex-1 relative hidden md:block bg-slate-100">
        <MockMap />

        {/* FLOATING ACTION */}
        <div className="absolute bottom-8 right-8 z-30">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition transform hover:-translate-y-1 flex items-center gap-2">
            <span>🎯</span> Recenter Map
          </button>
        </div>
      </main>
    </div>
  );
}

/* -----------------------------------------
   COMPONENTS
----------------------------------------- */
function Section({ title, children }) {
  return (
    <div className="mb-6 animate-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function PlaceCard({ data, type }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer group">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${type === 'police' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
            {type === 'police' ? '🚓' : '⚖️'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition">{data.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{data.address}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">Open Now</span>
              <span className="text-[10px] text-slate-400">• {data.distance} away</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            ⭐ {data.rating}
          </span>
        </div>
      </div>
    </div>
  );
}

function LawyerCard({ data }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition cursor-pointer group relative overflow-hidden">
      {data.plan === 'diamond' && <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-indigo-500 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8 z-0"></div>}

      <div className="flex gap-4 relative z-10">
        <img src={data.image} alt={data.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition">{data.name}</h4>
            {data.plan !== 'silver' && (
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${data.plan === 'diamond' ? 'bg-purple-100 text-purple-700' : 'bg-amber-50 text-amber-700'
                }`}>
                {data.plan}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-600 font-medium">{data.specialization}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">📍 {data.location}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">📏 {data.distance}</span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">⭐ {data.rating}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
        <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition">View Profile</button>
        <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition">Message</button>
      </div>
    </div>
  );
}

/* 
  Allows us to have a beautiful map background without an API key. 
  It uses CSS repeating gradients to simulate roads and blocks.
*/
function MockMap() {
  return (
    <div className="absolute inset-0 bg-[#E5E7EB] opacity-100 overflow-hidden">
      {/* Abstract Map Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
           linear-gradient(#cbd5e1 2px, transparent 2px), 
           linear-gradient(90deg, #cbd5e1 2px, transparent 2px),
           linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
           linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)
         `,
        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
      }}></div>

      {/* Mock Roads */}
      <div className="absolute top-0 left-1/3 w-8 h-full bg-white/40 skew-x-12 blur-[1px]"></div>
      <div className="absolute top-1/2 left-0 w-full h-6 bg-white/40 -rotate-6 blur-[1px]"></div>

      {/* Mock Pins */}
      <div className="absolute top-1/4 left-1/4 animate-bounce duration-[2000ms]">
        <div className="text-4xl filter drop-shadow-xl">📍</div>
      </div>
      <div className="absolute top-1/2 left-2/3 animate-bounce duration-[2500ms]">
        <div className="text-4xl filter drop-shadow-xl">👮‍♂️</div>
      </div>
      <div className="absolute bottom-1/3 left-1/2 animate-bounce duration-[3000ms]">
        <div className="text-4xl filter drop-shadow-xl">⚖️</div>
      </div>

      {/* Map Controls Fake */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">+</div>
        <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">-</div>
      </div>
    </div>
  );
}
