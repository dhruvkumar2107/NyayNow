import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 h-[72px] flex items-center tablet:px-0">
      <div className="max-w-[1128px] mx-auto w-full px-4 flex items-center justify-between gap-4">

        {/* LEFT: Logo & Search */}
        <div className="flex items-center gap-6 flex-1 max-w-xl">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-700 tracking-tight flex items-center gap-1 shrink-0"
          >
            <span className="text-3xl">⚖️</span>
            <span>NYAY-SATHI</span>
          </Link>

          {/* Search Input (Enterprise Style) */}
          <div className="hidden md:flex items-center w-full max-w-xs bg-[#EEF3F8] rounded-md px-3 py-2 transition hover:border-gray-300 border border-transparent focus-within:border-gray-400 focus-within:bg-white focus-within:w-full">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search lawyers, services..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-500 font-medium"
            />
          </div>
        </div>

        {/* CENTER/RIGHT: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-500">
          <NavLink to={user ? (user.role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard") : "/"} icon="🏠" label="Home" active={false} />
          <NavLink to="/marketplace" icon="👥" label="Network" />
          <NavLink to="/nearby" icon="💼" label="Jobs/Nearby" />
          <NavLink to="/messages" icon="💬" label="Messaging" />
          <NavLink to="/assistant" icon="🤖" label="Assistant" />
          <NavLink to="/agreements" icon="📄" label="Agreements" />
          <NavLink to="/pricing" icon="💎" label="Pricing" />
        </div>

        {/* RIGHT: Profile / Auth */}
        <div className="pl-4 border-l border-gray-200 ml-2 flex items-center gap-3">
          {user ? (
            <div className="flex flex-col items-center cursor-pointer group relative">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-1 ring-blue-50">
                {user.name?.[0]}
              </div>
              <span className="text-[10px] text-gray-600 mt-0.5 group-hover:text-gray-900 flex items-center">
                Me ▼
              </span>

              {/* Dropdown would go here, for now just logout button next to it or simplistic */}
              <button
                onClick={handleLogout}
                className="absolute top-10 right-0 w-24 bg-white shadow-lg border border-gray-100 rounded-lg py-2 text-center text-red-600 hover:bg-red-50 hidden group-hover:block"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/register"
                className="px-6 py-1.5 rounded-full text-gray-600 font-semibold text-base hover:bg-gray-100 transition"
              >
                Join now
              </Link>
              <Link
                to="/login"
                className="px-6 py-1.5 rounded-full text-blue-600 border border-blue-600 font-semibold text-base hover:bg-blue-50 transition"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-20 py-1 hover:text-gray-900 transition group ${active ? "text-gray-900 border-b-2 border-gray-900" : ""}`}>
      <span className="text-xl mb-0.5 group-hover:scale-110 transition">{icon}</span>
      <span className="tracking-wide hidden xl:block">{label}</span>
    </Link>
  )
}
