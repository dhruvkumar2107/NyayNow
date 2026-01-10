import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import toast from "react-hot-toast";

// FIX LEAFLET ICONS
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/* -----------------------------------------
   MOCK FALLBACK DATA (In case of API Failure)
----------------------------------------- */
const MOCK_NEARBY = {
  police: [
    { id: 'm-p1', name: "Andheri Police Station (Mock)", address: "Andheri East, Mumbai", rating: "4.5", lat: 19.1197, lon: 72.8464 },
    { id: 'm-p2', name: "Bandra Police Station (Mock)", address: "Bandra West, Mumbai", rating: "4.2", lat: 19.0544, lon: 72.8402 },
  ],
  courts: [
    { id: 'm-c1', name: "Mumbai District Court (Mock)", address: "Fort, Mumbai", rating: "4.8", lat: 18.9290, lon: 72.8310 },
  ],
  lawyers: [
    { id: 'm-l1', name: "Adv. Rahul Sharma", specialization: "Criminal Law", plan: "diamond", address: "Mumbai", lat: 19.0760, lon: 72.8777, rating: 5.0, image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 'm-l2', name: "Adv. Neha Verma", specialization: "Corporate Law", plan: "gold", address: "Delhi", lat: 28.6139, lon: 77.2090, rating: 4.9, image: "https://randomuser.me/api/portraits/women/44.jpg" },
  ],
};

// Custom Icons
const policeIcon = L.divIcon({
  html: '<div class="text-3xl filter drop-shadow-md">🚓</div>',
  className: 'bg-transparent',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const courtIcon = L.divIcon({
  html: '<div class="text-3xl filter drop-shadow-md">⚖️</div>',
  className: 'bg-transparent',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const lawyerIcon = L.divIcon({
  html: '<div class="text-3xl filter drop-shadow-md">👨‍⚖️</div>',
  className: 'bg-transparent',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Helper to randomize location around a center (for lawyers without specific lat/lon)
const getRandomLocation = (lat, lon, radiusKm = 3) => {
  const y0 = lat;
  const x0 = lon;
  const rd = radiusKm / 111.3;

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newLat = y + y0;
  const newLon = x / Math.cos(y0) + x0;

  return { lat: newLat, lon: newLon };
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function Nearby() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ police: [], courts: [], lawyers: [] });
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        await fetchRealData(latitude, longitude);
        setLoading(false);
        toast.success("Found your location!");
      },
      (error) => {
        console.error(error);
        toast.error("Could not get location. Showing Default (Delhi).");
        const defLat = 28.6139;
        const defLon = 77.2090;
        setUserLocation([defLat, defLon]);
        fetchRealData(defLat, defLon);
        setLoading(false);
      }
    );
  }, []);

  const fetchRealData = async (lat, lon) => {
    // Prepare promises for parallel execution
    const lawyersPromise = axios.get("/api/users?role=lawyer");
    const policePromise = axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=police+station&lat=${lat}&lon=${lon}&addressdetails=1&limit=10`);
    const courtsPromise = axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=court&lat=${lat}&lon=${lon}&addressdetails=1&limit=10`);

    // Wait for all to settle (success or fail independent)
    const [lawyersResult, policeResult, courtsResult] = await Promise.allSettled([
      lawyersPromise, policePromise, courtsPromise
    ]);

    const newData = { police: [], courts: [], lawyers: [] };

    // 1. PROCESS LAWYERS
    if (lawyersResult.status === "fulfilled") {
      try {
        newData.lawyers = lawyersResult.value.data.map(l => {
          const coords = getRandomLocation(lat, lon, 5);
          return {
            id: l._id,
            name: l.name,
            specialization: l.specialization || "Legal Consultant",
            plan: l.plan,
            address: l.location?.city || "Nearby",
            lat: coords.lat,
            lon: coords.lon,
            rating: l.stats?.rating || 4.5,
            image: l.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=0D8ABC&color=fff`
          };
        });
      } catch (err) { console.error("Error parsing lawyers", err); }
    } else {
      console.warn("Lawyer API failed, using Mock");
      // Generate mock lawyers around user location
      newData.lawyers = MOCK_NEARBY.lawyers.map(l => ({
        ...l, ...getRandomLocation(lat, lon, 2)
      }));
    }

    // 2. PROCESS POLICE
    if (policeResult.status === "fulfilled") {
      try {
        newData.police = policeResult.value.data
          .filter(p => p.class === 'amenity' && p.type === 'police')
          .map(p => {
            let placeName = p.name;
            const parts = p.display_name.split(', ');
            if (!placeName || placeName.toLowerCase().includes('police')) {
              placeName = parts[0];
            }
            return {
              id: p.place_id,
              name: placeName,
              address: parts.slice(1, 4).join(', '),
              lat: parseFloat(p.lat),
              lon: parseFloat(p.lon),
              rating: (3.8 + Math.random()).toFixed(1)
            };
          });
      } catch (err) { console.error("Error parsing police", err); }
    }

    // Mock fallback if empty or failed
    if (newData.police.length === 0) {
      newData.police = MOCK_NEARBY.police.map(p => ({
        ...p, ...getRandomLocation(lat, lon, 3)
      }));
    }

    // 3. PROCESS COURTS
    if (courtsResult.status === "fulfilled") {
      try {
        newData.courts = courtsResult.value.data.map(c => {
          const parts = c.display_name.split(', ');
          return {
            id: c.place_id,
            name: c.name || parts[0],
            address: parts.slice(1, 4).join(', '),
            lat: parseFloat(c.lat),
            lon: parseFloat(c.lon),
            rating: (4.0 + Math.random()).toFixed(1)
          };
        });
      } catch (err) { console.error("Error parsing courts", err); }
    }

    // Mock fallback if empty or failed
    if (newData.courts.length === 0) {
      newData.courts = MOCK_NEARBY.courts.map(c => ({
        ...c, ...getRandomLocation(lat, lon, 4)
      }));
    }

    setData(newData);
  };

  const categories = [
    { id: "all", label: "All Services", icon: "🗺️" },
    { id: "police", label: "Police", icon: "🚓" },
    { id: "courts", label: "Courts", icon: "⚖️" },
    { id: "lawyers", label: "Lawyers", icon: "👨‍⚖️" },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Scanning satellites for legal aid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-72px)] bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl relative">
        <div className="p-6 border-b border-slate-100 bg-white z-10 sticky top-0">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Nearby Support</h1>
          <p className="text-sm text-slate-500 mb-4">Real-time legal services around you</p>

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

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
          {(selectedCategory === 'all' || selectedCategory === 'police') && (
            <Section title="Nearby Police Stations">
              {data.police.length > 0 ? data.police.map(p => <PlaceCard key={p.id} data={p} type="police" />) : <p className="text-sm text-gray-400 italic px-2">No police stations found nearby.</p>}
            </Section>
          )}

          {(selectedCategory === 'all' || selectedCategory === 'courts') && (
            <Section title="Nearby Courts">
              {data.courts.length > 0 ? data.courts.map(c => <PlaceCard key={c.id} data={c} type="court" />) : <p className="text-sm text-gray-400 italic px-2">No courts found nearby.</p>}
            </Section>
          )}

          {(selectedCategory === 'all' || selectedCategory === 'lawyers') && (
            <Section title="Registered Lawyers">
              {data.lawyers.length > 0 ? data.lawyers.map(l => <LawyerCard key={l.id} data={l} />) : <p className="text-sm text-gray-400 italic px-2">No lawyers registered yet.</p>}
            </Section>
          )}
        </div>
      </aside>

      {/* MAP */}
      <main className="flex-1 relative z-10 w-full h-full">
        {userLocation && (
          <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={userLocation} />

            {/* ME */}
            <Marker position={userLocation}>
              <Popup>You are here 📍</Popup>
            </Marker>

            {/* PINS */}
            {(selectedCategory === 'all' || selectedCategory === 'police') && data.police.map(p => (
              <Marker key={p.id} position={[p.lat, p.lon]} icon={policeIcon}>
                <Popup><b>{p.name}</b><br />{p.address}</Popup>
              </Marker>
            ))}
            {(selectedCategory === 'all' || selectedCategory === 'courts') && data.courts.map(c => (
              <Marker key={c.id} position={[c.lat, c.lon]} icon={courtIcon}>
                <Popup><b>{c.name}</b><br />{c.address}</Popup>
              </Marker>
            ))}
            {(selectedCategory === 'all' || selectedCategory === 'lawyers') && data.lawyers.map(l => (
              <Marker key={l.id} position={[l.lat, l.lon]} icon={lawyerIcon}>
                <Popup>
                  <div className="text-center">
                    <b className="text-blue-600">{l.name}</b><br />
                    {l.specialization}<br />
                    <Link to={`/lawyer/${l.id}`} className="text-xs underline text-blue-500">View Profile</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        <div className="absolute bottom-8 right-8 z-[1000]">
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(pos => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                toast.success("Recentered!");
              })
            }}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span>🎯</span> My Location
          </button>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PlaceCard({ data, type }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer group">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${type === 'police' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
            {type === 'police' ? '🚓' : '⚖️'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-1">{data.name}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{data.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LawyerCard({ data }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition cursor-pointer group">
      <div className="flex gap-4">
        <img src={data.image} alt={data.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">{data.name}</h4>
          <p className="text-xs text-blue-600 font-medium">{data.specialization}</p>
          <Link to={`/lawyer/${data.id}`} className="block mt-2 text-xs font-bold text-slate-500 hover:text-blue-600">View Profile →</Link>
        </div>
        {data.plan === 'diamond' && <span className="text-xs">💎</span>}
      </div>
    </div>
  );
}
