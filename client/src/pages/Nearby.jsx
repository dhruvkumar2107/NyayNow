import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

// ICONS
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

const createCustomIcon = (emoji) => L.divIcon({
  html: `<div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-slate-900 border-b-4 transform hover:scale-110 transition-all">${emoji}</div>`,
  className: 'bg-transparent',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const policeIcon = createCustomIcon('🚓');
const courtIcon = createCustomIcon('⚖️');
const lawyerIcon = createCustomIcon('👨‍⚖️');

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
  return { lat: y + y0, lon: x / Math.cos(y0) + x0 };
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { animate: true });
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

  const fetchOverpass = async (lat, lon, amenities) => {
    const radius = 10000;
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"${amenities}"](around:${radius},${lat},${lon});
        way["amenity"~"${amenities}"](around:${radius},${lat},${lon});
        relation["amenity"~"${amenities}"](around:${radius},${lat},${lon});
      );
      out center;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    return axios.get(url);
  };

  const fetchRealData = async (lat, lon) => {
    const lawyersPromise = axios.get("/api/users?role=lawyer");
    const policePromise = fetchOverpass(lat, lon, "police");
    const courtsPromise = fetchOverpass(lat, lon, "courthouse");

    const [lawyersResult, policeResult, courtsResult] = await Promise.allSettled([
      lawyersPromise, policePromise, courtsPromise
    ]);

    const newData = { police: [], courts: [], lawyers: [] };

    if (lawyersResult.status === "fulfilled") {
      try {
        newData.lawyers = lawyersResult.value.data.map(l => {
          const coords = (l.location && l.location.lat) ? { lat: l.location.lat, lon: l.location.long } : getRandomLocation(lat, lon, 5);
          return {
            id: l._id, name: l.name, specialization: l.specialization || "Legal Consultant", plan: l.plan,
            address: l.location?.city || "Nearby", lat: coords.lat, lon: coords.lon, rating: l.stats?.rating || 4.5,
            image: l.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=0D8ABC&color=fff`
          };
        });
      } catch (e) { }
    } else {
      newData.lawyers = MOCK_NEARBY.lawyers.map(l => ({ ...l, ...getRandomLocation(lat, lon, 2) }));
    }

    if (policeResult.status === "fulfilled") {
      try {
        newData.police = policeResult.value.data.elements.map(p => ({
          id: p.id, name: p.tags?.name || "Police Station", address: p.tags?.['addr:street'] || "Local Station",
          lat: p.lat || p.center?.lat, lon: p.lon || p.center?.lon, rating: 4.0
        })).filter(p => p.name !== "Police Station");
      } catch (e) { }
    }
    if (newData.police.length === 0) newData.police = [{ id: 'fallback-p', name: "Nearby Police Station", address: "Locating...", lat: lat + 0.002, lon: lon + 0.002, rating: 4.0 }];

    if (courtsResult.status === "fulfilled") {
      try {
        newData.courts = courtsResult.value.data.elements.map(c => ({
          id: c.id, name: c.tags?.name || "District Court", address: c.tags?.['addr:street'] || "Local Court",
          lat: c.lat || c.center?.lat, lon: c.lon || c.center?.lon, rating: 4.5
        })).slice(0, 10);
      } catch (e) { }
    }
    if (newData.courts.length === 0) newData.courts = [{ id: 'fallback-c', name: "District Court", address: "Locating...", lat: lat - 0.002, lon: lon - 0.002, rating: 4.5 }];

    setData(newData);
  };

  const categories = [
    { id: "all", label: "All", icon: "🗺️" },
    { id: "police", label: "Police", icon: "🚓" },
    { id: "courts", label: "Courts", icon: "⚖️" },
    { id: "lawyers", label: "Lawyers", icon: "👨‍⚖️" },
  ];

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center">
        <span className="text-6xl animate-bounce mb-4">🛰️</span>
        <h2 className="text-2xl font-bold">Scanning Your Area...</h2>
        <p className="text-slate-400">Triangulating legal aid, courts, and stations.</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full z-[1000]">
        <Navbar />
      </div>

      {/* FLOATING SIDEBAR */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-24 left-6 z-40 w-full max-w-sm h-[calc(100vh-120px)] pointer-events-none"
      >
        <div className="w-full h-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden pointer-events-auto">
          <div className="p-6 border-b border-slate-200/50">
            <h1 className="text-2xl font-black text-slate-900">Nearby Finder</h1>
            <p className="text-sm text-slate-500 font-medium">Real-time Legal Assistance Map</p>

            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {(selectedCategory === 'all' || selectedCategory === 'police') && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Police Stations</h3>
                {data.police.map(p => <Card key={p.id} data={p} type="police" />)}
              </div>
            )}
            {(selectedCategory === 'all' || selectedCategory === 'courts') && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Courts</h3>
                {data.courts.map(c => <Card key={c.id} data={c} type="court" />)}
              </div>
            )}
            {(selectedCategory === 'all' || selectedCategory === 'lawyers') && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Lawyers</h3>
                {data.lawyers.map(l => <LawyerCard key={l.id} data={l} />)}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* MAP */}
      <div className="w-full h-full z-0">
        {userLocation && (
          <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater center={userLocation} />

            <Marker position={userLocation}>
              <Popup><div className="font-bold text-center">📍 You Are Here</div></Popup>
            </Marker>

            {(selectedCategory === 'all' || selectedCategory === 'police') && data.police.map(p => (
              <Marker key={p.id} position={[p.lat, p.lon]} icon={policeIcon}><Popup><b>{p.name}</b><br />{p.address}</Popup></Marker>
            ))}
            {(selectedCategory === 'all' || selectedCategory === 'courts') && data.courts.map(c => (
              <Marker key={c.id} position={[c.lat, c.lon]} icon={courtIcon}><Popup><b>{c.name}</b><br />{c.address}</Popup></Marker>
            ))}
            {(selectedCategory === 'all' || selectedCategory === 'lawyers') && data.lawyers.map(l => (
              <Marker key={l.id} position={[l.lat, l.lon]} icon={lawyerIcon}>
                <Popup>
                  <div className="text-center p-2">
                    <img src={l.image} className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-slate-900" />
                    <b className="text-slate-900">{l.name}</b><br />
                    <span className="text-xs text-slate-500">{l.specialization}</span><br />
                    <Link to={`/lawyer/${l.id}`} className="block mt-2 bg-slate-900 text-white text-xs px-2 py-1 rounded">Profile</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* LOCATE BUTTON */}
      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition(pos => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            toast.success("Recentered!");
          })
        }}
        className="absolute bottom-10 right-10 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition active:scale-95"
      >
        🎯
      </button>

    </div>
  );
}

const Card = ({ data, type }) => (
  <div className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition flex gap-3 cursor-pointer group">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${type === 'police' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
      {type === 'police' ? '🚓' : '⚖️'}
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{data.name}</h4>
      <p className="text-xs text-slate-500 truncate max-w-[180px]">{data.address}</p>
    </div>
  </div>
);

const LawyerCard = ({ data }) => (
  <div className="bg-white hover:bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm transition flex gap-3 cursor-pointer group">
    <img src={data.image} className="w-10 h-10 rounded-full border border-slate-200" />
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition">{data.name} {data.plan === 'diamond' && '💎'}</h4>
      <p className="text-xs text-slate-500">{data.specialization}</p>
      <Link to={`/lawyer/${data.id}`} className="text-[10px] font-bold text-blue-600 hover:underline">View Profile</Link>
    </div>
  </div>
);
