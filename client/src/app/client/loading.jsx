export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading Workspace...</p>
      </div>
    </div>
  );
}
