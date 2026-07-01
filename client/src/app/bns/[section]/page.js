'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, ShieldAlert, Languages, Sparkles } from 'lucide-react';

const SECTIONS_DB = {
  'section-103': {
    title: 'BNS Section 103 (Punishment for Murder)',
    oldIpc: 'IPC Section 302',
    offense: 'Murder / Culpable Homicide amounting to Murder',
    punishment: 'Death or imprisonment for life, and shall also be liable to fine.',
    languages: {
      'English': {
        explanation: 'Section 103 of the Bharatiya Nyaya Sanhita (BNS) 2024 prescribes the punishment for murder. It states that whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
        elements: [
          'Intention of causing death.',
          'Intention of causing such bodily injury as the offender knows to be likely to cause death.',
          'Sufficient in the ordinary course of nature to cause death.'
        ]
      },
      'Hindi': {
        explanation: 'भारतीय न्याय संहिता (BNS) 2024 की धारा 103 हत्या के लिए सजा का प्रावधान करती है। इसके अनुसार जो कोई भी हत्या करेगा, उसे मृत्युदंड या आजीवन कारावास की सजा दी जाएगी, और वह जुर्माने के लिए भी उत्तरदायी होगा।',
        elements: [
          'मृत्यु कारित करने का इरादा।',
          'ऐसी शारीरिक क्षति पहुँचाने का इरादा जिसके बारे में अपराधी जानता हो कि उससे मृत्यु होने की संभावना है।',
          'प्रकृति के सामान्य क्रम में मृत्यु कारित करने के लिए पर्याप्त शारीरिक चोट।'
        ]
      },
      'Tamil': {
        explanation: 'பாரதிய நியாய சன்ஹிதா (BNS) 2024 இன் பிரிவு 103 கொலைக்கான தண்டனையை பரிந்துரைக்கிறது. கொலை செய்பவருக்கு மரண தண்டனை அல்லது ஆயுள் தண்டனை மற்றும் அபராதம் விதிக்கப்படும்.',
        elements: [
          'மரணத்தை விளைவிக்கும் நோக்கம்.',
          'மரணத்தை விளைவிக்கக்கூடிய உடல் காயத்தை ஏற்படுத்தும் நோக்கம்.',
          'இயற்கையான முறையில் மரணத்தை ஏற்படுத்த போதுமான உடல் காயம்.'
        ]
      }
    }
  },
  'section-303': {
    title: 'BNS Section 303 (Punishment for Theft)',
    oldIpc: 'IPC Section 379',
    offense: 'Theft (Stealing movable property without consent)',
    punishment: 'Imprisonment up to three years, or with fine, or with both, and in case of second conviction, with rigorous imprisonment up to five years.',
    languages: {
      'English': {
        explanation: 'Section 303 of the BNS 2024 defines the punishment for theft. Theft involves dishonestly taking any movable property out of the possession of any person without that person\'s consent.',
        elements: [
          'Dishonest intention to take property.',
          'Property must be movable.',
          'Taken out of the possession of any person without consent.'
        ]
      },
      'Hindi': {
        explanation: 'भारतीय न्याय संहिता 2024 की धारा 303 चोरी की सजा को परिभाषित करती है। चोरी में किसी व्यक्ति की सहमति के बिना उसकी सहमति के बिना बेईमानी से किसी चल संपत्ति को उसके कब्जे से बाहर ले जाना शामिल है।',
        elements: [
          'संपत्ति लेने का बेईमान इरादा।',
          'संपत्ति चल (movable) होनी चाहिए।',
          'सहमति के बिना किसी भी व्यक्ति के कब्जे से बाहर ले जाया गया हो।'
        ]
      },
      'Tamil': {
        explanation: 'BNS 2024 இன் பிரிவு 303 திருட்டுக்கான தண்டனையை வரையறுக்கிறது. திருட்டு என்பது ஒரு நபரின் அனுமதியின்றி அவரது உடைமையிலிருந்து ஏதேனும் அசையும் சொத்தை நேர்மையற்ற முறையில் எடுப்பதை உள்ளடக்குகிறது.',
        elements: [
          'சொத்தை எடுக்கும் நேர்மையற்ற நோக்கம்.',
          'சொத்து அசையும் சொத்தாக இருக்க வேண்டும்.',
          'அனுமதியின்றி ஒரு நபரின் உடைமையிலிருந்து எடுக்கப்பட்டது.'
        ]
      }
    }
  },
  'section-318': {
    title: 'BNS Section 318 (Cheating and Dishonestly Inducing Delivery)',
    oldIpc: 'IPC Section 420',
    offense: 'Cheating / Fraudulent inducement',
    punishment: 'Imprisonment up to seven years, and shall also be liable to fine.',
    languages: {
      'English': {
        explanation: 'Section 318 of BNS 2024 covers cheating. Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person commits this offense.',
        elements: [
          'Deception of any person.',
          'Fraudulently or dishonestly inducing that person to deliver property.',
          'Intentional inducement causing damage or harm to body, mind, or property.'
        ]
      },
      'Hindi': {
        explanation: 'भारतीय न्याय संहिता 2024 की धारा 318 धोखाधड़ी और बेईमानी से संपत्ति सुपुर्द करने के लिए प्रेरित करने से संबंधित है (पुराना IPC 420)। जो कोई भी किसी व्यक्ति को धोखा देता है और बेईमानी से संपत्ति सौंपने के लिए प्रेरित करता है, वह यह अपराध करता है।',
        elements: [
          'किसी व्यक्ति को धोखा देना।',
          'धोखा खाए व्यक्ति को संपत्ति सौंपने के लिए बेईमानी से प्रेरित करना।',
          'जानबूझकर प्रेरित करना जिससे शरीर, मन या संपत्ति को नुकसान हो।'
        ]
      },
      'Tamil': {
        explanation: 'BNS 2024 இன் பிரிவு 318 ஏமாற்றுதலை உள்ளடக்கியது. ஏமாற்றி, அதன் மூலம் நேர்மையற்ற முறையில் ஏமாற்றப்பட்ட நபரை எந்தவொரு சொத்தையும் ஒப்படைக்க தூண்டுபவர் இந்த குற்றத்தைச் செய்கிறார்.',
        elements: [
          'ஏதேனும் ஒரு நபரை ஏமாற்றுதல்.',
          'சொத்தை ஒப்படைக்க அந்த நபரை ஏமாற்றி அல்லது நேர்மையற்ற முறையில் தூண்டுதல்.',
          'உடல், மனது அல்லது சொத்துக்கு சேதம் விளைவிக்கும் நோக்கம் கொண்ட தூண்டுதல்.'
        ]
      }
    }
  }
};

export default function SectionSEOPage({ params }) {
  const sectionKey = params.section?.toLowerCase() || 'section-303';
  const sectionData = SECTIONS_DB[sectionKey] || {
    title: `BNS ${sectionKey.replace('-', ' ').toUpperCase()}`,
    oldIpc: 'Relevant IPC Equivalent',
    offense: 'Offense details under Bharatiya Nyaya Sanhita 2024',
    punishment: 'Refer to official BNS schedule for exact details.',
    languages: {
      'English': {
        explanation: `Detailed explanation of BNS ${sectionKey.replace('-', ' ').toUpperCase()} is being indexed. Consult our AI Assistant for instant queries.`,
        elements: ['Statutory elements of the offense.']
      }
    }
  };

  const [activeLang, setActiveLang] = useState('English');
  const langData = sectionData.languages[activeLang] || sectionData.languages['English'];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pt-28 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Breadcrumbs */}
        <div className="flex gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-slate-400">BNS Directory</span>
          <span>/</span>
          <span className="text-blue-400">{sectionKey.toUpperCase()}</span>
        </div>

        {/* Section Header Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Scale size={12} /> Bharatiya Nyaya Sanhita (BNS) 2024
              </span>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-slate-500" />
                <select
                  value={activeLang}
                  onChange={e => setActiveLang(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 transition"
                >
                  {Object.keys(sectionData.languages).map(l => (
                    <option key={l} value={l} className="bg-slate-950 text-white">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                {sectionData.title}
              </h1>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">
                Formerly equivalent to: <span className="text-white font-bold">{sectionData.oldIpc}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Type of Offense</span>
                <p className="text-white font-bold">{sectionData.offense}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Punishment Details</span>
                <p className="text-white font-bold">{sectionData.punishment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main text explanation */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-white/5 pb-3">Legal Interpretation</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{langData.explanation}</p>
            
            <h3 className="text-lg font-bold text-white pt-4">Essential Elements</h3>
            <ul className="space-y-3">
              {langData.elements.map((elem, i) => (
                <li key={i} className="flex gap-3 text-xs leading-relaxed text-slate-400">
                  <span className="w-5 h-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center shrink-0 font-bold">{i+1}</span>
                  <span className="pt-0.5">{elem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* conversion CTA column */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden text-center space-y-4">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Sparkles size={120} />
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-600/20">
                ⚖️
              </div>
              <div className="space-y-2">
                <h4 className="font-serif font-black text-white text-base">Facing charges under {sectionKey.toUpperCase()}?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get instant legal guidance. Speak to our AI assistant to analyze details, evaluate precedents, and draft FIR/notice responses.
                </p>
              </div>
              <Link
                href={`/assistant?question=Explain my rights under BNS ${sectionKey.replace('-', ' ').toUpperCase()}`}
                className="w-full py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-500 hover:text-white transition flex items-center justify-center gap-1.5 shadow-lg"
              >
                Consult AI Assistant <ArrowRight size={12} />
              </Link>
              <span className="text-[10px] text-slate-500 block">Free tier gets 10 queries per month</span>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 text-[10px] text-slate-500 leading-relaxed">
              <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Legal Information Disclaimer:</strong> The information provided on this page is for general educational awareness under the Bharatiya Nyaya Sanhita (BNS) 2024. It does not constitute legal counsel.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
