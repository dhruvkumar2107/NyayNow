'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Languages, ArrowRightLeft, Copy, Trash2, Volume2, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { name: "English", code: "en" },
  { name: "हिंदी (Hindi)", code: "hi" },
  { name: "தமிழ் (Tamil)", code: "ta" },
  { name: "తెలుగు (Telugu)", code: "te" },
  { name: "ಕನ್ನಡ (Kannada)", code: "kn" },
  { name: "मराठी (Marathi)", code: "mr" },
  { name: "বাংলা (Bengali)", code: "bn" },
  { name: "ગુજરાતી (Gujarati)", code: "gu" },
  { name: "മലയാളം (Malayalam)", code: "ml" },
  { name: "ਪੰਜਾਬੀ (Punjabi)", code: "pa" },
  { name: "اردو (Urdu)", code: "ur" }
];

export default function BhashiniTranslator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('हिंदी (Hindi)');
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState('');

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setTranslating(true);
    setTranslatedText('');
    setProvider('');

    try {
      const srcName = sourceLang.split(' ')[0];
      const tgtName = targetLang.split(' ')[0];

      const res = await axios.post('/api/translate', {
        text: sourceText,
        sourceLanguage: srcName,
        targetLanguage: tgtName
      });

      setTranslatedText(res.data.translatedText);
      setProvider(res.data.provider);
      toast.success("Translation complete!");
    } catch (err) {
      console.error(err);
      toast.error("Translation failed. Service offline.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!translatedText) return;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    // Attempt mapping
    const langCodes = {
      "hi": "hi-IN", "ta": "ta-IN", "te": "te-IN", "kn": "kn-IN",
      "mr": "mr-IN", "bn": "bn-IN", "gu": "gu-IN", "ml": "ml-IN",
      "pa": "pa-IN", "en": "en-US", "ur": "ur-PK"
    };
    const tgt = targetLang.split(' ')[0];
    const item = LANGUAGES.find(l => l.name.startsWith(tgt));
    if (item && langCodes[item.code]) {
      utterance.lang = langCodes[item.code];
    }
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-xs font-bold uppercase tracking-widest">
          <Languages size={14} /> National Language Translation Mission (NLTM)
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Bhashini <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Legal Translate</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light">
          Break the language barrier. Instantly translate legal notices, contracts, and advice across 11 official Indian languages powered by Bhashini pipelines.
        </p>
      </div>

      {/* Grid Translator */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Source Text Area */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4 relative flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Document</span>
            <select
              value={sourceLang}
              onChange={e => setSourceLang(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 transition"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.name} className="bg-slate-950 text-white">{l.name}</option>
              ))}
            </select>
          </div>

          <textarea
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            placeholder="Type or paste legal text to translate..."
            className="w-full h-64 bg-transparent outline-none text-white placeholder-slate-600 resize-none text-sm leading-relaxed custom-scrollbar pt-2"
          />

          <div className="flex justify-between items-center border-t border-white/5 pt-4">
            <button
              onClick={() => setSourceText('')}
              className="p-2 text-slate-500 hover:text-white transition"
              title="Clear input"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating || !sourceText.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg"
            >
              {translating ? <span className="animate-spin">🌀</span> : <Sparkles size={12} />}
              Translate
            </button>
          </div>
        </div>

        {/* Swap button (middle overlay on large screens) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
          <button
            onClick={handleSwap}
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center hover:scale-115 transition"
            title="Swap Languages"
          >
            <ArrowRightLeft size={14} />
          </button>
        </div>

        {/* Target Text Area */}
        <div className="bg-[#0c1020]/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4 relative flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Translation Output</span>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 transition"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.name} className="bg-slate-950 text-white">{l.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full h-64 overflow-y-auto text-slate-200 text-sm leading-relaxed custom-scrollbar whitespace-pre-wrap pt-2">
            {translating ? (
              <div className="flex items-center gap-1.5 text-slate-500 animate-pulse">
                <span>Translating document...</span>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-600 italic">Translated legal output will appear here...</span>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-4">
            <div className="flex gap-2">
              <button
                onClick={handleSpeak}
                disabled={!translatedText}
                className="p-2 text-slate-500 hover:text-white disabled:opacity-30 transition"
                title="Listen (Speech)"
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-2 text-slate-500 hover:text-white disabled:opacity-30 transition"
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
            {provider && (
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-white/5 px-2.5 py-1 rounded border border-white/5">
                Engine: {provider}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
