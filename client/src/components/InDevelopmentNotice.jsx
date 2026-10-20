export default function InDevelopmentNotice({ eyebrow, title, children }) {
  return (
    <main className="min-h-screen bg-[#020617] px-6 pb-20 pt-36 text-slate-200">
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-8">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 text-3xl font-bold text-white">{title}</h1>
        <div className="mt-4 leading-7 text-slate-300">{children}</div>
        <p className="mt-6 text-xs text-slate-500">
          AI-assisted. Verify against primary sources and consult a qualified advocate.
        </p>
      </section>
    </main>
  );
}
