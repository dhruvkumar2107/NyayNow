import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { lawyerFeed, suggestedLawyers /* repurpose for networking */ } from "../components/dashboard/FeedMetadata";

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    try {
      // Fetch open cases (leads)
      const res = await axios.get("/api/cases?open=true");
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    }
  };

  const acceptLead = async (id) => {
    try {
      await axios.post(`/api/cases/${id}/accept`, { lawyerPhone: user.phone || user.email });
      alert("Lead Accepted! You can now contact the client.");
      fetchLeads(); // Refresh
    } catch (err) {
      alert("Failed to accept lead");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts");
    }
  };

  const handleCreatePost = async () => {
    if (!postContent && !postFile) return;

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      formData.append("email", user.email);
      formData.append("type", postType);
      if (postFile) formData.append("file", postFile);

      const res = await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setPosts([res.data, ...posts]);
      setPostContent("");
      setPostFile(null);
      setPostType("text");
    } catch (err) {
      alert("Failed to post");
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.post(`/api/posts/${id}/like`, { email: user.email });
      fetchPosts();
    } catch (err) {
      console.error("Like failed");
    }
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <DashboardLayout
      /* LEFT SIDEBAR - LAWYER PROFILE */
      leftSidebar={
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="h-20 bg-blue-600"></div>
          <div className="px-5 pb-5 -mt-10">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm mb-3">
              {user.name && user.name.length > 0 ? user.name[0] : ""}
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium" title="Verified Advocate">✓ Verified</span>
            </div>
            <p className="text-sm text-gray-500">{user.specialization || "Legal Consultant"}</p>
            <p className="text-xs text-gray-400 mt-1">{user.location}</p>

            <div className="my-4 border-t border-gray-100"></div>

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Profile Views</span>
                <span className="text-gray-900 font-semibold">128</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Search Appearances</span>
                <span className="text-gray-900 font-semibold">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rating</span>
                <span className="text-yellow-500 font-semibold">4.8 ★</span>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">My Workspace</div>
              <ul className="space-y-1">
                <SidebarItem icon="⚡" label="Lead Manager" count={leads.length} />
                <SidebarItem icon="📅" label="Calendar & Events" />
                <SidebarItem icon="📈" label="Analytics" />
                <SidebarItem icon="⚙️" label="Account Settings" />
              </ul>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition text-sm font-semibold text-gray-600 text-center relative">
            <label className="cursor-pointer block w-full h-full">
              {user.resume ? "✓ Resume Uploaded" : "📄 Upload Resume"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    // 1. Upload File
                    const upRes = await axios.post("/api/uploads", formData, {
                      headers: { "Content-Type": "multipart/form-data" }
                    });

                    // 2. Update Profile
                    const filePath = upRes.data.path;
                    await axios.put(`/api/users/${user.phone || user.email}`, { resume: filePath });

                    alert("Resume uploaded successfully! Verification pending.");
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert("Upload failed.");
                  }
                }}
              />
            </label>
          </div>
          <button
            onClick={logout}
            className="w-full p-4 border-t border-gray-100 bg-red-50 hover:bg-red-100 cursor-pointer transition text-sm font-semibold text-red-600 text-center"
          >
            Logout
          </button>
        </div>
      }
      /* CENTER FEED - LEADS */
      mainFeed={
        <>
          {/* Create Post / Quick Action */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex gap-4">
              <Link to="/messages" className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-center transition">
                <span className="block text-2xl mb-1">💬</span>
                <span className="text-sm text-gray-600 font-medium">Client Messages</span>
              </Link>
              <button
                onClick={() => alert("Calendar Integration Coming Soon!")}
                className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-center transition"
              >
                <span className="block text-2xl mb-1">📅</span>
                <span className="text-sm text-gray-600 font-medium">My Calendar</span>
              </button>
              <Link to="/pricing" className="flex-1 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg p-3 text-center transition">
                <span className="block text-2xl mb-1">🚀</span>
                <span className="text-sm text-blue-700 font-medium">Boost Profile</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-semibold text-gray-700">New Client Leads</h3>
            <span className="text-xs text-gray-500">Based on your specialization</span>
          </div>

          {leads.length === 0 && <p className="text-gray-500 italic p-4 text-center">No new leads available.</p>}

          {leads.map((lead) => (
            <div key={lead._id} className="bg-white border border-gray-200 rounded-lg p-5 mb-4 hover:shadow-md transition shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-md">{lead.title}</h4>
                  <p className="text-sm text-gray-500">{lead.location || "Online"} • {new Date(lead.postedAt).toLocaleTimeString()}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold border border-green-200">
                  {lead.budget || "₹ Negotiable"}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2 mb-4 leading-relaxed">
                {lead.desc}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => acceptLead(lead._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition shadow-sm"
                >
                  Accept Lead
                </button>
                <button
                  onClick={() => setLeads(leads.filter(l => l._id !== lead._id))}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
                >
                  Refuse
                </button>
              </div>
            </div>
          ))}
        </>
      }
      /* RIGHT SIDEBAR */
      rightSidebar={
        <>
          {/* Trending Topics */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Trending in Law</h3>
            <ul className="space-y-3">
              {topics.map((t) => (
                <li key={t._id} className="text-sm">
                  <p className="font-medium text-blue-700">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.count} posts</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Feed Section (Lawyer's View) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm mt-8">
            <h3 className="font-bold text-gray-900 mb-4">📢 Legal Community Feed</h3>

            {/* Create Post */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <textarea
                  placeholder="Share a legal update or case study..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 outline-none resize-none"
                  rows={2}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />

                {postFile && (
                  <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <span>📎 Attached: {postFile.name}</span>
                    <button onClick={() => setPostFile(null)} className="text-red-500 hover:text-red-700">✕</button>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <label className="cursor-pointer flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 transition">
                      <span>📷</span> Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setPostFile(e.target.files[0])} />
                    </label>

                    <label className="cursor-pointer flex items-center gap-1 text-gray-500 hover:text-purple-600 text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 transition">
                      <span>🎥</span> Reel
                      <input type="file" className="hidden" accept="video/mp4" onChange={(e) => {
                        setPostType("reel");
                        setPostFile(e.target.files[0]);
                      }} />
                    </label>
                  </div>

                  <button
                    onClick={handleCreatePost}
                    disabled={!postContent && !postFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Update
                  </button>
                </div>
              </div>
            </div>

            {/* Feed List */}
            {posts.map((post) => (
              <div key={post._id} className="border-t border-gray-100 py-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                      {post.author?.name ? post.author.name[0] : "L"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{post.author?.name || "Lawyer"}</h4>
                      <p className="text-xs text-gray-500">
                        {post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

                {post.mediaUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 bg-black">
                    {post.type === "reel" || (post.mediaUrl && post.mediaUrl.endsWith(".mp4")) ? (
                      <video
                        src={post.mediaUrl?.startsWith("http") ? post.mediaUrl : `http://localhost:4000${post.mediaUrl}`}
                        controls
                        className="w-full max-h-[400px]"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl?.startsWith("http") ? post.mediaUrl : `http://localhost:4000${post.mediaUrl}`}
                        alt="Post attachment"
                        className="w-full object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex gap-6 text-sm text-gray-500">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`hover:text-blue-600 transition flex items-center gap-1 ${post.likes?.includes(user._id) ? "text-blue-600 font-bold" : ""}`}
                  >
                    👍 {post.likes?.length || 0} Likes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      }
    />
  );
}

function SidebarItem({ icon, label, count }) {
  return (
    <li
      onClick={() => alert(`Navigating to ${label}... (Coming Soon)`)}
      className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition group"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-gray-600 group-hover:text-gray-900">
        <span className="text-gray-400 group-hover:text-blue-600">{icon}</span>
        {label}
      </div>
      {count !== undefined && <span className="text-xs font-semibold text-gray-500">{count}</span>}
    </li>
  )
}
