import { useState, useEffect } from "react";
import axios from "axios";

export default function LegalReels() {
    const [reels, setReels] = useState([]);

    useEffect(() => {
        axios.get("/api/posts").then(res => {
            // Filter for reels/videos only
            const videoPosts = res.data.filter(p => p.type === "reel" || (p.mediaUrl && p.mediaUrl.endsWith(".mp4")));
            setReels(videoPosts);
        });
    }, []);

    if (reels.length === 0) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-6 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                <span>🎬</span> Community Reels
            </h3>
            <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
                {reels.map((v) => (
                    <div key={v._id} className="min-w-[120px] max-w-[120px] group cursor-pointer">
                        <div className="h-48 bg-black rounded-xl relative overflow-hidden mb-2 shadow-sm">
                            <video
                                src={`${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${v.mediaUrl}`}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-3xl text-white opacity-80">▶</span>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600">{v.content || "Untitled Reel"}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{v.author?.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
