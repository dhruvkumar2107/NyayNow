const lawyers = [
  {
    name: "Adv. Neha Kapoor",
    specialization: "Corporate & Startup Law",
    city: "Bengaluru",
    experience: "9 years",
    rating: "4.8 ★",
  },
  {
    name: "Adv. Aman Singh",
    specialization: "Criminal Defense",
    city: "Delhi",
    experience: "12 years",
    rating: "4.6 ★",
  },
  {
    name: "Adv. Sneha Joshi",
    specialization: "Family & Divorce Law",
    city: "Pune",
    experience: "7 years",
    rating: "4.7 ★",
  },
];

export default function Lawyers() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2">
          Verified Lawyers
        </h1>
        <p className="text-slate-400 mb-8">
          Trusted legal professionals across India.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {lawyers.map((lawyer, i) => (
            <div
              key={i}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition"
            >
              <h3 className="text-lg font-semibold">{lawyer.name}</h3>
              <p className="text-sm text-slate-400 mb-2">
                {lawyer.specialization}
              </p>
              <p className="text-sm text-slate-400">
                {lawyer.city} • {lawyer.experience}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-yellow-400">
                  {lawyer.rating}
                </span>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
