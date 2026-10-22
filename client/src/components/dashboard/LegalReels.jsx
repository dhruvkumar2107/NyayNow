'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_HOST } from "../../config";

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
    }, [user]);

    if (reels.length === 0) return null;

    return (
        <div className="mi-glass-card relative mt-8 overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--gold)]/10 blur-2xl"></div>

            <h3 className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)]"></span>
                Community Reels
            </h3>

            <div className="scrollbar-hide flex gap-5 overflow-x-auto px-1 pb-2">
                {reels.map((v) => (
                    <div key={v._id} className="group/item min-w-[140px] max-w-[140px] cursor-pointer">
                        <div className="relative mb-3 h-56 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-black/40 transition group-hover/item:border-[var(--gold)]/50">
                            <video
                                src={`${API_HOST}${v.mediaUrl}`}
                                className="h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover/item:opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover/item:opacity-0"></div>
                            <div className="absolute inset-0 flex scale-90 items-center justify-center opacity-0 transition-all duration-300 group-hover/item:scale-100 group-hover/item:opacity-100">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold-hairline)] bg-white/10 backdrop-blur-md">
                                    <span className="ml-1 text-xl text-white">▶</span>
                                </div>
                            </div>
                        </div>
                        <p className="line-clamp-2 text-[11px] font-semibold uppercase leading-tight tracking-tight text-[var(--text)] transition-colors group-hover/item:text-[var(--gold)]">{v.content || "Untitled Reel"}</p>
                        <div className="mt-2 flex items-center gap-2 opacity-70">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[8px] font-bold text-[var(--gold-soft)]">
                                {v.author?.name?.[0] || "?"}
                            </div>
                            <p className="truncate text-[9px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{v.author?.name || "Member"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
