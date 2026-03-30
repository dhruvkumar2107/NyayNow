'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function LegalReels() {
    const { user } = useAuth();
    const [reels, setReels] = useState([]);

    useEffect(() => {
        if (!user) return;
        const uId = user._id || user.id;
        axios.get(`/api/posts?userId=${uId}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                // Filter for reels/videos only
                const videoPosts = data.filter(p => p.type === "reel" || (p.mediaUrl && p.mediaUrl.endsWith(".mp4")));
                setReels(videoPosts);
            })
            .catch(err => {
                console.error("Reels Error:", err);
                setReels([]);
            });
    }, []);

    if (reels.length === 0) return null;

    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 mt-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

            <h3 className="font-bold text-[10px] text-slate-500 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_5px_rgba(99,102,241,1)]"></span>
                Community Reels
            </h3>

            <div className="flex overflow-x-auto gap-5 scrollbar-hide pb-2 px-1">
                {reels.map((v) => (
                    <div key={v._id} className="min-w-[140px] max-w-[140px] group/item cursor-pointer">
                        <div className="h-56 bg-black/40 rounded-2xl relative overflow-hidden mb-3 border border-white/5 group-hover/item:border-indigo-500/30 transition-all duration-300 shadow-inner">
                            <video
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${v.mediaUrl}`}
                                className="w-full h-full object-cover opacity-60 group-hover/item:opacity-90 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/item:opacity-0 transition-opacity"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform scale-90 group-hover/item:scale-100">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                    <span className="text-xl text-white ml-1">▶</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight group-hover/item:text-indigo-400 transition-colors uppercase tracking-tight">{v.content || "Untitled Reel"}</p>
                        <div className="flex items-center gap-2 mt-2 opacity-60">
                            <div className="w-4 h-4 bg-indigo-500/20 rounded-full flex items-center justify-center text-[8px] font-black text-indigo-400">
                                {v.author?.name?.[0] || "?"}
                            </div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{v.author?.name || "Member"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
