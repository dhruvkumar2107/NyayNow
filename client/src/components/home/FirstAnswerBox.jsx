'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, ShieldAlert, Lock } from 'lucide-react';
import { askAssistant } from '../../api';

const SAMPLE_QUESTIONS = [
  'What should I do if police refuse to register my FIR?',
  'How is cheating under BNS different from IPC 420?',
  'My landlord will not return my security deposit. What are my options?',
];

export default function FirstAnswerBox() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);

  const ask = async (e, overrideQuestion) => {
    e?.preventDefault();
    const q = (overrideQuestion ?? question).trim();
    if (!q || loading) return;
    if (overrideQuestion) setQuestion(overrideQuestion);
    setLoading(true);
    setError('');
    setAnswer(null);
    setRelated([]);
    setLimitReached(false);
    try {
      const data = await askAssistant({ question: q, language: 'English' });
      setAnswer(data.answer || '');
      setRelated(
        Array.isArray(data.related_questions) ? data.related_questions.slice(0, 3) : []
      );
    } catch (err) {
      const code = err?.code;
      if (code === 'GUEST_LIMIT_REACHED' || code === 'LOGIN_REQUIRED') {
        setLimitReached(true);
        setError(err.message || 'Free guest limit reached. Sign in to continue.');
      } else {
        setError(err?.message || 'Could not get an answer right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto mt-12 text-left"
    >
      <div className="mi-glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[var(--gold)]" />
          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
            Try a first question - no sign-up
          </span>
        </div>

        <form onSubmit={ask} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="first-answer-input" className="sr-only">
            Ask a legal question
          </label>
          <input
            id="first-answer-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a general legal question..."
            maxLength={2000}
            className="mi-focus flex-1 bg-transparent border border-[var(--gold-hairline)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="mi-tap mi-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--gold)] px-5 py-3 font-semibold text-[#0B1220] disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Thinking' : 'Ask'}
          </button>
        </form>

        {!answer && !error && !loading ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuestion(s)}
                className="mi-focus rounded-full border border-[var(--gold-hairline)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:text-[var(--text)]"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Searching statutes and drafting a plain-language answer...
          </p>
        ) : null}

        {answer ? (
          <div className="mt-4 border-t border-[var(--gold-hairline)] pt-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--text)]">{answer}</p>
            {related.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(null, q)}
                    className="mi-focus rounded-full border border-[var(--gold-hairline)] px-3 py-1.5 text-xs text-[var(--gold-soft)] transition hover:text-[var(--text)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="mt-4 flex items-start gap-2 text-xs text-[var(--text-muted)]">
              <ShieldAlert size={14} className="mt-0.5 shrink-0 text-[var(--warn)]" />
              <span>
                AI guidance, not legal advice. Citations are not verified. Check official sources
                and consult a practising advocate before acting.
              </span>
            </p>
            <Link
              href="/assistant"
              className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--gold-soft)] underline"
            >
              Continue in the full assistant
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 border-t border-[var(--gold-hairline)] pt-4">
            <p className="flex items-start gap-2 text-sm text-[var(--text)]">
              <Lock size={16} className="mt-0.5 shrink-0 text-[var(--sos)]" />
              <span>{error}</span>
            </p>
            {limitReached ? (
              <Link
                href="/register"
                className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-white px-4 py-2 text-sm font-semibold text-[#0B1220]"
              >
                Create a free account
                <ArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
        Guests get 3 free questions per day. Sign up for more.
      </p>
    </motion.div>
  );
}
