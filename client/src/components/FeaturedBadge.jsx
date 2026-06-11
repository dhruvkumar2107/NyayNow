export default function FeaturedBadge({ tier = 'free' }) {
  if (tier === 'premium') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
        ⭐ Featured
      </span>
    );
  }
  if (tier === 'standard') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
        ✓ Verified Pro
      </span>
    );
  }
  return null;
}
