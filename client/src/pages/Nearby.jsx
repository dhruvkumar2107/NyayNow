import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Shield, Gavel, User, Navigation } from "lucide-react";

// ICONS
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
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
        toast.success("Location Triangulated. Systems Online.");
      },
      (error) => {
        console.error(error);
        toast.error("GPS Signal Weak. Falling back to default.");
        const defLat = 28.6139;
        const defLon = 77.2090;
        setUserLocation([defLat, defLon]);
        fetchRealData(defLat, defLon);
        setLoading(false);
      }
    );
  }, []);

  const fetchRealData = async (lat, lon) => {
    try {
      const res = await axios.get(`/api/nearby?lat=${lat}&lon=${lon}`);
      const rawData = res.data || [];

      // Filter Data
      const police = rawData.filter(i => i.type === 'police');
      const courts = rawData.filter(i => i.type === 'court');
      const lawyers = rawData.filter(i => i.type === 'lawyer').map(l => ({
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
    <div className="h-screen w-full flex items-center justify-center bg-midnight-950 text-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-bold mt-6 tracking-widest uppercase">Initializing Satellites</h2>
        <p className="text-indigo-400 font-mono text-sm mt-2">Triangulating verified coordinates...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans bg-[#020617]">
      <div className="absolute top-0 left-0 w-full z-[1000]">
        <Navbar />
      </div>

      {/* FLOATING SIDEBAR */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="absolute top-24 left-6 z-[500] w-full max-w-sm h-[calc(100vh-120px)] pointer-events-none"
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

      {/* MAP */}
      <div className="w-full h-full z-0 block bg-slate-900">
        {userLocation && (
          <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none" style={{ background: '#0f172a' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
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
                    <Link to={`/lawyer/${l.id}`} className="block mt-3 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition">Full Profile</Link>
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
        className="absolute bottom-10 right-10 z-[500] bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-indigo-500 transition active:scale-95 border border-indigo-400/50"
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
    {data.plan === 'diamond' && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/20 to-transparent pointer-events-none"></div>}
    <img src={data.image} className="w-10 h-10 rounded-full border border-white/10" />
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-200 text-sm truncate group-hover:text-white transition flex items-center gap-2">
        {data.name}
        {data.plan === 'diamond' && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">PRO</span>}
      </h4>
      <p className="text-xs text-indigo-400 font-bold">{data.specialization}</p>
      <Link to={`/lawyer/${data.id}`} className="block mt-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-wider transition">View Dossier →</Link>
    </div>
  </div>
);
