import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

/* -----------------------------------------
   MOCK NEARBY DATA (BACKEND LATER)
----------------------------------------- */
const MOCK_NEARBY = {
  police_stations: [
    {
      name: "Andheri Police Station",
      distance: "1.2 km",
      address: "Andheri East, Mumbai",
    },
    {
      name: "Bandra Police Station",
      distance: "3.8 km",
      address: "Bandra West, Mumbai",
    },
  ],

  courts: [
    {
      name: "Mumbai District Court",
      distance: "4.5 km",
    },
    {
      name: "High Court of Bombay",
      distance: "7.1 km",
    },
  ],

  lawyers: [
    {
      id: 1,
      name: "Adv. Rahul Sharma",
      specialization: "Criminal Law",
      location: "Mumbai",
      plan: "diamond",
      distance: "1.5 km",
    },
    {
      id: 2,
      name: "Adv. Neha Verma",
      specialization: "Corporate Law",
      location: "Mumbai",
      plan: "gold",
      distance: "2.8 km",
    },
    {
      id: 3,
      name: "Adv. Ankit Patel",
      specialization: "Family Law",
      location: "Mumbai",
      plan: "silver",
      distance: "4.2 km",
    },
  ],
};

const planPriority = {
  diamond: 3,
  gold: 2,
  silver: 1,
};

export default function Nearby() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported. Using default location (Bengaluru).");
      fetchNearbyData(null, null); // Fallback
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchNearbyData(latitude, longitude);
      },
      () => {
        setError("Location permission denied. Using default location (Bengaluru).");
        fetchNearbyData(null, null); // Fallback
      }
    );
  };

  const fetchNearbyData = async (lat, lon) => {
    try {
      setLoading(true);
      // Construct URL with query params
      let url = "http://localhost:4000/api/nearby";
      if (lat && lon) {
        url += `?lat=${lat}&lon=${lon}`;
      } else {
        url += `?query=Bengaluru legal help`;
      }

      const res = await axios.get(url);

      // Transform backend array to frontend shape
      // Backend returns flat array of objects with { full details } 
      // We need to categorize them for the UI logic
      const raw = res.data;

      const structured = {
        police_stations: raw.filter(i => i.type === 'police'),
        courts: raw.filter(i => i.type === 'court'),
        lawyers: raw.filter(i => i.type === 'legal_aid' || i.type === 'lawyer').map((l, idx) => ({
          id: idx,
          name: l.name,
          specialization: "General Practice",
          location: l.address,
          plan: idx === 0 ? "diamond" : "silver", // Mock plan assignment
          distance: "Nearby"
        }))
      };

      setData(structured);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch nearby data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-24">
      <div className="max-w-[1128px] mx-auto">
        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Nearby Legal Help
          </h1>
          <p className="text-gray-500 mt-2">
            Find police stations, courts, and lawyers near you
          </p>
        </header>

        {/* ACTION */}
        <button
          onClick={findNearby}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition mb-10 font-bold shadow-md shadow-blue-200"
        >
          {loading ? "Locating..." : "📍 Find Nearby Services"}
        </button>

        {error && (
          <p className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>
        )}

        {data && (
          <section className="space-y-12">
            {/* POLICE */}
            <Block title="🚓 Police Stations">
              <div className="grid md:grid-cols-2 gap-4">
                {data.police_stations.map((p, i) => (
                  <Item
                    key={i}
                    title={p.name}
                    subtitle={`${p.distance} • ${p.address}`}
                  />
                ))}
              </div>
            </Block>

            {/* COURTS */}
            <Block title="⚖️ Courts">
              <div className="grid md:grid-cols-2 gap-4">
                {data.courts.map((c, i) => (
                  <Item
                    key={i}
                    title={c.name}
                    subtitle={c.distance}
                  />
                ))}
              </div>
            </Block>

            {/* LAWYERS */}
            <Block title="👨‍⚖️ Lawyers Near You">
              <div className="grid md:grid-cols-3 gap-6">
                {data.lawyers.map((l) => (
                  <LawyerCard key={l.id} lawyer={l} />
                ))}
              </div>
            </Block>

            {/* UPGRADE CTA */}
            {user?.role === "lawyer" &&
              user.plan === "silver" && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold text-blue-900">
                    Get More Clients Near You
                  </h2>
                  <p className="text-blue-600 mt-2">
                    Upgrade to Gold or Diamond to appear
                    higher in nearby results.
                  </p>

                  <button className="mt-4 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md">
                    Upgrade Membership
                  </button>
                </div>
              )}
          </section>
        )}
      </div>
    </main>
  );
}

/* -----------------------------------------
   REUSABLE COMPONENTS
----------------------------------------- */
function Block({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2 inline-block pr-6">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Item({ title, subtitle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-gray-500 text-sm mt-1">
        {subtitle}
      </p>
    </div>
  );
}

function LawyerCard({ lawyer }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition group">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
          {lawyer.name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lawyer.plan === "diamond"
            ? "bg-purple-100 text-purple-700 border border-purple-200"
            : lawyer.plan === "gold"
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
        >
          {lawyer.plan.toUpperCase()}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
        <span className="text-blue-500">⚖️</span> {lawyer.specialization}
      </p>
      <p className="text-sm text-gray-500 flex items-center gap-2">
        <span className="text-blue-500">📍</span> {lawyer.distance}
      </p>

      <button className="mt-4 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 font-medium border border-gray-200 transition">
        View Profile
      </button>
    </div>
  );
}
