export default function FeeTransparency({ invoices }) {
    if (!invoices || invoices.length === 0) return null;

    const total = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const paid = invoices.filter(i => i.status === 'paid').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const pending = total - paid;
    const paidPercent = total === 0 ? 0 : (paid / total) * 100;

    return (
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Fee Transparency</h3>
                <span className="text-xs font-bold text-slate-400">Total Charged: ₹{total.toLocaleString()}</span>
            </div>

            {/* Visual Bar */}
            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex mb-2">
                <div style={{ width: `${paidPercent}%` }} className="bg-emerald-500 h-full"></div>
                <div className="flex-1 bg-amber-500/50 h-full"></div>
            </div>

            <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">● Paid: ₹{paid.toLocaleString()}</span>
                <span className="text-amber-400">● Pending: ₹{pending.toLocaleString()}</span>
            </div>

            {/* Recent Invoice List (Mini) */}
            <div className="mt-4 space-y-2">
                {invoices.slice(0, 3).map(inv => (
                    <div key={inv._id} className="flex justify-between text-xs border-b border-white/5 pb-1 last:border-0">
                        <span className="text-slate-400">{inv.description || "Legal Service"}</span>
                        <span className={inv.status === 'paid' ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                            ₹{inv.amount} {inv.status === 'paid' ? '✓' : '⚠'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
