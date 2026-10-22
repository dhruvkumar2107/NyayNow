'use client'

import Link from 'next/link';

export default function Blog() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 pb-20 pt-36 text-slate-300">
      <article className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Editorial review in development</p>
        <h1 className="mt-5 text-4xl font-bold text-white">NyayNow Insights</h1>
        <p className="mt-5 leading-7 text-slate-400">NyayNow has not published reviewed legal explainers, case analyses, or product performance articles yet. We will publish source-linked material after editorial and legal review.</p>
        <Link className="mt-8 inline-block text-blue-300 underline" href="/methodology/benchmark">View product evaluation status</Link>
      </article>
    </main>
  );
}
