import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
        <h1 className="text-indigo-400 font-bold text-lg">
          NYAY-SATHI
        </h1>

        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-400">Home</Link>
          <Link to="/assistant">Assistant</Link>
          <Link to="/analyze">Analyze</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/login" className="text-indigo-400 font-semibold">
            Login
          </Link>
        </nav>
      </header>

      <main className="px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
