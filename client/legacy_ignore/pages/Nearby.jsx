'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../../src/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Shield, Gavel, User, Navigation, Scan, X } from "lucide-react";

// ICONS
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MOCK_NEARBY = {
  police: [
    { id: 'm-p1', name: "Andheri Police Station", address: "Andheri East, Mumbai", rating: "4.5", lat: 19.1197, lon: 72.8464 },
    { id: 'm-p2', name: "Bandra Police Station", address: "Bandra West, Mumbai", rating: "4.2", lat: 19.0544, lon: 72.8402 },
  ],
  courts: [
    { id: 'm-c1', name: "Mumbai District Court", address: "Fort, Mumbai", rating: "4.8", lat: 18.9290, lon: 72.8310 },
  ],
  lawyers: [
    { id: 'm-l1', name: "Adv. Rahul Sharma", specialization: "Criminal Law", plan: "diamond", address: "Mumbai", lat: 19.0760, lon: 72.8777, rating: 5.0, image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 'm-l2', name: "Adv. Neha Verma", specialization: "Corporate Law", plan: "gold", address: "Delhi", lat: 28.6139, lon: 77.2090, rating: 4.9, image: "https://randomuser.me/api/portraits/women/44.jpg" },
  ],
};

const createCustomIcon = (emoji) => L.divIcon({
  html: `<div class="w-12 h-12 bg-midnight-900 rounded-full flex items-center justify-center text-2xl shadow-2xl border-2 border-white transform hover:scale-110 transition-all">${emoji}</div>`,
  className: 'bg-transparent',
  iconSize: [48, 48],
  iconAnchor: [24, 48]
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
    if (center) map.flyTo(center, 13, { animate: true, duration: 2 });
  }, [center, map]);
  return null;
}

export default function Nearby() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ police: [], courts: [], lawyers: [] });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAR, setShowAR] = useState(false);

  useEffect(() => {
    const fetchLocation = () => {
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
          toast.success("Location Triangulated. Systems Online.");
        },
        (error) => {
          console.error("Location error:", error);
          if (error.code === 1) {
            toast.error("Location permission denied. Using New Delhi as default.");
          } else {
            toast.error("GPS Signal Weak. Falling back to default.");
          }
          const defLat = 28.6139;
          const defLon = 77.2090;
          setUserLocation([defLat, defLon]);
          fetchRealData(defLat, defLon);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    fetchLocation();
  }, []);

  const fetchRealData = async (lat, lon) => {
    try {
      const res = await axios.get(`/api/nearby?lat=${lat}&lon=${lon}`);
      const rawData = res.data || [];

      // Filter Data & Validate Coordinates
      const validData = rawData.filter(i => i.lat && i.lon && !isNaN(i.lat) && !isNaN(i.lon));

      const police = validData.filter(i => i.type === 'police');
      const courts = validData.filter(i => i.type === 'court');
      const lawyers = validData.filter(i => i.type === 'lawyer').map(l => ({
        ...l,
        id: l.id || l._id || Math.random().toString(36).substr(2, 9),
        // Ensure image and plan are present
        image: l.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=0D8ABC&color=fff`,
        plan: l.plan || 'basic'
      }));

      setData({ police, courts, lawyers });
    } catch (err) {
      console.error("Failed to fetch nearby data", err);
      toast.error("Radar Interference. Using Local Cache.");
      // Fallback
      setData(MOCK_NEARBY);
    }
  };

  const categories = [
    { id: "all", label: "All Assets", icon: <MapPin size={16} /> },
    { id: "police", label: "Police", icon: <Shield size={16} /> },
    { id: "courts", label: "Courts", icon: <Gavel size={16} /> },
    { id: "lawyers", label: "Lawyers", icon: <User size={16} /> },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0c1220] font-sans pb-20 flex items-center justify-center text-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-bold mt-6 tracking-widest uppercase">Initializing Satellites</h2>
        <p className="text-indigo-400 font-mono text-sm mt-2">Triangulating verified coordinates...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans">
      <Navbar />

      {/* FLOATING SIDEBAR */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="absolute top-32 left-6 z-[500] w-full max-w-sm h-[calc(100vh-140px)] pointer-events-none"
      >
        <div className="w-full h-full bg-[#020617]/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden pointer-events-auto">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
            <h1 className="text-2xl font-black text-white font-serif mb-1">Radar</h1>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-6">Real-time Legal Assets</p>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border ${selectedCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {(selectedCategory === 'all' || selectedCategory === 'police') && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Police Stations</h3>
                {data.police.map(p => <Card key={p.id} data={p} type="police" />)}
              </div>
            )}
            {(selectedCategory === 'all' || selectedCategory === 'courts') && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Judicial Courts</h3>
                {data.courts.map(c => <Card key={c.id} data={c} type="court" />)}
              </div>
            )}
            {(selectedCategory === 'all' || selectedCategory === 'lawyers') && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Available Counsel</h3>
                {data.lawyers.map(l => <LawyerCard key={l.id} data={l} />)}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* AR VIEW TOGGLE (NEW) */}
      <div className="absolute top-32 right-6 z-[500]">
        <button
          onClick={() => setShowAR(!showAR)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-2xl transition-all ${showAR ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-900 hover:bg-indigo-50'}`}
        >
          {showAR ? <X size={18} /> : <Scan size={18} />}
          {showAR ? "Close AR Vision" : "Enable AR Vision"}
        </button>
      </div>

      {/* AR OVERLAY (MOCK) */}
      <AnimatePresence>
        {showAR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] bg-black/50 pointer-events-none"
          >
            {/* Camera Feed Simulator */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517331566373-cf67e9140d33?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>

            {/* HUD Elements */}
            <div className="absolute inset-0 border-[20px] border-indigo-500/20 rounded-[3rem] m-4 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            </div>

            {/* Floating AR Markers */}
            {data.lawyers.slice(0, 2).map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                style={{ top: `${30 + i * 20}%`, left: `${20 + i * 40}%` }}
                className="absolute pointer-events-auto cursor-pointer"
              >
                <div className="bg-black/80 backdrop-blur-md border border-indigo-500 p-4 rounded-xl text-center shadow-[0_0_30px_rgba(79,70,229,0.6)]">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500 mx-auto -mt-10 overflow-hidden bg-slate-900">
                    <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-white font-bold mt-2 text-sm">{l.name}</h4>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase">{l.specialization}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">{0.4 + i * 0.3} km away</p>
                  <Link href={`/lawyer/${l.id}`} className="block mt-2 bg-indigo-600 text-[10px] py-1 rounded text-white font-bold">Connect</Link>
                </div>
                <div className="w-0.5 h-20 bg-gradient-to-b from-indigo-500 to-transparent mx-auto"></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAP */}
      <div className="absolute inset-0 z-0 bg-slate-900 pt-[110px]">
        {userLocation && (
          <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none" style={{ background: '#0f172a' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                  <div className="text-center p-2 min-w-[200px]">
                    <img src={l.image} className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-slate-900" />
                    <b className="text-slate-900 text-lg">{l.name}</b><br />
                    <span className="text-xs text-indigo-600 font-bold uppercase">{l.specialization}</span><br />
                    <Link href={`/lawyer/${l.id}`} className="block mt-3 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition">Full Profile</Link>
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
            toast.success("Recalibrating Coordinates...");
          })
        }}
        className="fixed bottom-10 right-10 z-[500] bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-indigo-500 transition active:scale-95 border border-indigo-400/50"
      >
        <Navigation size={24} />
      </button>

    </div>
  );
}

const Card = ({ data, type }) => (
  <div className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition flex gap-4 cursor-pointer group">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${type === 'police' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
      {type === 'police' ? '🚓' : '⚖️'}
    </div>
    <div>
      <h4 className="font-bold text-slate-200 text-sm group-hover:text-white transition">{data.name}</h4>
      <p className="text-xs text-slate-500 truncate max-w-[180px]">{data.address}</p>
    </div>
  </div>
);

const LawyerCard = ({ data }) => (
  <div className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition flex gap-4 cursor-pointer group relative overflow-hidden">
    <img src={data.image} className="w-10 h-10 rounded-full border border-white/10" />
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-200 text-sm truncate group-hover:text-white transition flex items-center gap-2">
        {data.name}
      </h4>
      <p className="text-xs text-indigo-400 font-bold">{data.specialization}</p>
      <Link href={`/lawyer/${data.id}`} className="block mt-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-wider transition">View Dossier →</Link>
    </div>
  </div>
);
