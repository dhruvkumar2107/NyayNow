// This file uses Next.js server-side metadata generation for SEO
// and a client-side interactive component for language switching

import BnsSectionClient from './BnsSectionClient';

// ─── Static Data ─────────────────────────────────────────────────────────────
export const SECTIONS_DB = {
  'section-103': {
    title: 'BNS Section 103 — Punishment for Murder',
    shortTitle: 'BNS Section 103',
    oldIpc: 'IPC Section 302',
    offense: 'Murder / Culpable Homicide amounting to Murder',
    punishment: 'Death or imprisonment for life, and shall also be liable to fine.',
    keywords: [
      'BNS Section 103', 'BNS 103 murder punishment', 'Bharatiya Nyaya Sanhita 103',
      'hathya BNS dhara 103', 'IPC 302 new equivalent', 'murder law India 2024',
      'BNS dhara 103 in Hindi', 'BNS section 103 in Tamil'
    ],
    faqs: [
      { q: 'What is BNS Section 103?', a: 'BNS Section 103 replaces IPC Section 302. It prescribes the punishment for murder as death or imprisonment for life along with fine.' },
      { q: 'What is the punishment for murder under BNS?', a: 'Under BNS Section 103, murder is punishable with death sentence or life imprisonment, and also a monetary fine.' },
      { q: 'Is BNS Section 103 the same as IPC 302?', a: 'Yes. BNS (Bharatiya Nyaya Sanhita) 2024 Section 103 is the equivalent of the old IPC Section 302 relating to punishment for murder.' }
    ],
    relatedSections: [
      { section: 'section-318', label: 'BNS 318 (Cheating / IPC 420)' },
      { section: 'section-303', label: 'BNS 303 (Theft / IPC 379)' }
    ],
    languages: {
      'English': {
        explanation: 'Section 103 of the Bharatiya Nyaya Sanhita (BNS) 2024 prescribes the punishment for murder. It states that whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. This replaces the erstwhile Section 302 of the Indian Penal Code (IPC).',
        elements: [
          'Intentional causing of death.',
          'Causing bodily injury that the offender knows is likely to cause death.',
          'Act sufficient in the ordinary course of nature to cause death.',
          'Knowledge that the act is so imminently dangerous that it must cause death.'
        ]
      },
      'Hindi': {
        explanation: 'भारतीय न्याय संहिता (BNS) 2024 की धारा 103 हत्या के लिए सजा का प्रावधान करती है। इसके अनुसार जो कोई भी हत्या करेगा, उसे मृत्युदंड या आजीवन कारावास की सजा दी जाएगी, और वह जुर्माने के लिए भी उत्तरदायी होगा। यह पुरानी आईपीसी की धारा 302 की जगह लेती है।',
        elements: [
          'मृत्यु कारित करने का जानबूझकर इरादा।',
          'ऐसी शारीरिक क्षति पहुँचाने का इरादा जिससे मृत्यु होने की संभावना हो।',
          'प्रकृति के सामान्य क्रम में मृत्यु कारित करने के लिए पर्याप्त कार्य।',
          'यह जानते हुए कार्य करना कि उससे मृत्यु हो सकती है।'
        ]
      },
      'Tamil': {
        explanation: 'பாரதிய நியாய சன்ஹிதா (BNS) 2024 இன் பிரிவு 103 கொலைக்கான தண்டனையை பரிந்துரைக்கிறது. கொலை செய்பவருக்கு மரண தண்டனை அல்லது ஆயுள் தண்டனை மற்றும் அபராதம் விதிக்கப்படும். இது பழைய IPC பிரிவு 302 ஐ மாற்றுகிறது.',
        elements: [
          'மரணத்தை விளைவிக்கும் வேண்டுமென்றே நோக்கம்.',
          'மரணத்தை விளைவிக்கக்கூடிய உடல் காயத்தை ஏற்படுத்தும் நோக்கம்.',
          'இயற்கையான முறையில் மரணத்தை ஏற்படுத்த போதுமான செயல்.',
          'செயல் மரணத்தை ஏற்படுத்தக்கூடும் என்று தெரிந்திருந்தும் செய்வது.'
        ]
      }
    }
  },
  'section-303': {
    title: 'BNS Section 303 — Punishment for Theft',
    shortTitle: 'BNS Section 303',
    oldIpc: 'IPC Section 379',
    offense: 'Theft (Dishonestly taking movable property without consent)',
    punishment: 'Imprisonment up to three years, or with fine, or with both. Repeat offenders face up to five years rigorous imprisonment.',
    keywords: [
      'BNS Section 303', 'BNS 303 theft punishment', 'Bharatiya Nyaya Sanhita 303',
      'chori BNS dhara 303', 'IPC 379 new equivalent', 'theft law India 2024',
      'BNS dhara 303 in Hindi', 'BNS section 303 in Tamil', 'theft punishment India'
    ],
    faqs: [
      { q: 'What is BNS Section 303?', a: 'BNS Section 303 corresponds to IPC Section 379. It defines the punishment for theft as imprisonment up to three years, fine, or both.' },
      { q: 'What is the punishment for theft under BNS 2024?', a: 'Under BNS Section 303, theft is punishable with imprisonment of up to 3 years, or fine, or both. A second-time offender can face rigorous imprisonment up to 5 years.' },
      { q: 'What is the difference between IPC 379 and BNS 303?', a: 'BNS Section 303 is the direct replacement for IPC Section 379 under the new Bharatiya Nyaya Sanhita 2024 criminal code.' }
    ],
    relatedSections: [
      { section: 'section-318', label: 'BNS 318 (Cheating / IPC 420)' },
      { section: 'section-103', label: 'BNS 103 (Murder / IPC 302)' }
    ],
    languages: {
      'English': {
        explanation: 'Section 303 of the BNS 2024 defines the punishment for theft. Theft involves dishonestly taking any movable property out of the possession of any person without that person\'s consent. This replaces Section 379 of the Indian Penal Code.',
        elements: [
          'Dishonest intention to take property.',
          'Property must be movable.',
          'Taken out of the possession of any person without consent.',
          'The taking must be done with the intent to cause wrongful gain or wrongful loss.'
        ]
      },
      'Hindi': {
        explanation: 'भारतीय न्याय संहिता 2024 की धारा 303 चोरी की सजा को परिभाषित करती है। चोरी में किसी व्यक्ति की सहमति के बिना बेईमानी से किसी चल संपत्ति को उसके कब्जे से बाहर ले जाना शामिल है। यह पुरानी आईपीसी की धारा 379 की जगह लेती है।',
        elements: [
          'संपत्ति लेने का बेईमान इरादा।',
          'संपत्ति चल (movable) होनी चाहिए।',
          'सहमति के बिना किसी भी व्यक्ति के कब्जे से बाहर ले जाना।',
          'गलत लाभ या गलत हानि पहुँचाने के इरादे से लेना।'
        ]
      },
      'Tamil': {
        explanation: 'BNS 2024 இன் பிரிவு 303 திருட்டுக்கான தண்டனையை வரையறுக்கிறது. திருட்டு என்பது ஒரு நபரின் அனுமதியின்றி அவரது உடைமையிலிருந்து ஏதேனும் அசையும் சொத்தை நேர்மையற்ற முறையில் எடுப்பதை உள்ளடக்குகிறது. இது பழைய IPC பிரிவு 379 ஐ மாற்றுகிறது.',
        elements: [
          'சொத்தை எடுக்கும் நேர்மையற்ற நோக்கம்.',
          'சொத்து அசையும் சொத்தாக இருக்க வேண்டும்.',
          'அனுமதியின்றி ஒரு நபரின் உடைமையிலிருந்து எடுக்கப்பட்டது.',
          'தவறான ஆதாயம் அல்லது தவறான இழப்பை ஏற்படுத்தும் நோக்கம்.'
        ]
      }
    }
  },
  'section-318': {
    title: 'BNS Section 318 — Cheating and Dishonestly Inducing Delivery',
    shortTitle: 'BNS Section 318',
    oldIpc: 'IPC Section 420',
    offense: 'Cheating / Fraudulent inducement to deliver property',
    punishment: 'Imprisonment up to seven years, and shall also be liable to fine.',
    keywords: [
      'BNS Section 318', 'BNS 318 cheating punishment', 'Bharatiya Nyaya Sanhita 318',
      'dhokha BNS dhara 318', 'IPC 420 new equivalent', 'cheating law India 2024',
      'BNS dhara 318 in Hindi', 'BNS section 318 in Tamil', 'fraud punishment India'
    ],
    faqs: [
      { q: 'What is BNS Section 318?', a: 'BNS Section 318 is the new equivalent of IPC Section 420. It covers cheating and dishonestly inducing delivery of property, punishable by up to 7 years imprisonment plus fine.' },
      { q: 'What is the punishment for cheating under BNS 2024?', a: 'Under BNS Section 318, cheating is punishable with imprisonment up to 7 years and a monetary fine.' },
      { q: 'Is BNS 318 same as IPC 420?', a: 'Yes. BNS Section 318 replaces IPC Section 420 under the Bharatiya Nyaya Sanhita 2024.' }
    ],
    relatedSections: [
      { section: 'section-303', label: 'BNS 303 (Theft / IPC 379)' },
      { section: 'section-103', label: 'BNS 103 (Murder / IPC 302)' }
    ],
    languages: {
      'English': {
        explanation: 'Section 318 of BNS 2024 covers cheating. Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy any document which is or purports to be a valuable security commits this offense. This replaces IPC Section 420.',
        elements: [
          'Deception of any person.',
          'Fraudulently or dishonestly inducing that person to deliver property.',
          'Intentional inducement to make, alter or destroy a valuable document.',
          'The act causes or is likely to cause damage or harm to body, mind or property.'
        ]
      },
      'Hindi': {
        explanation: 'भारतीय न्याय संहिता 2024 की धारा 318 धोखाधड़ी से संबंधित है (पुराना IPC 420)। जो कोई भी किसी व्यक्ति को धोखा देकर उसे बेईमानी से संपत्ति सौंपने के लिए प्रेरित करता है, वह यह अपराध करता है। इसे 7 साल तक की कारावास और जुर्माने से दंडित किया जाता है।',
        elements: [
          'किसी व्यक्ति को धोखा देना।',
          'धोखा खाए व्यक्ति को बेईमानी से संपत्ति सौंपने के लिए प्रेरित करना।',
          'मूल्यवान दस्तावेज बनाने, बदलने या नष्ट करने के लिए प्रेरित करना।',
          'जानबूझकर नुकसान पहुँचाने वाला कार्य।'
        ]
      },
      'Tamil': {
        explanation: 'BNS 2024 இன் பிரிவு 318 ஏமாற்றுதலை உள்ளடக்கியது (பழைய IPC 420). ஏமாற்றி, அதன் மூலம் நேர்மையற்ற முறையில் ஏமாற்றப்பட்ட நபரை எந்தவொரு சொத்தையும் ஒப்படைக்க தூண்டுபவர் இந்த குற்றத்தைச் செய்கிறார். இது 7 ஆண்டுகள் வரை சிறைத்தண்டனை மற்றும் அபராதத்திற்கு தண்டிக்கப்படும்.',
        elements: [
          'ஏதேனும் ஒரு நபரை ஏமாற்றுதல்.',
          'சொத்தை ஒப்படைக்க அந்த நபரை நேர்மையற்ற முறையில் தூண்டுதல்.',
          'மதிப்புமிக்க ஆவணத்தை உருவாக்க அல்லது மாற்ற தூண்டுதல்.',
          'சேதம் விளைவிக்கும் நோக்கம் கொண்ட செயல்.'
        ]
      }
    }
  }
};

// ─── Server-Side Metadata (SEO, Open Graph, Twitter Cards) ───────────────────
export async function generateMetadata({ params }) {
  const sectionKey = params.section?.toLowerCase() || 'section-303';
  const data = SECTIONS_DB[sectionKey];
  const baseUrl = 'https://nyaynow.in';

  if (!data) {
    return {
      title: `${sectionKey.replace('-', ' ').toUpperCase()} | BNS Legal Guide | NyayNow`,
      description: `Understand your rights under BNS ${sectionKey.toUpperCase()}. Instant AI legal guidance in Hindi, Tamil, Telugu and more Indian languages.`
    };
  }

  const title = `${data.title} | BNS Guide in Hindi, Tamil & English | NyayNow`;
  const description = `${data.offense} under Bharatiya Nyaya Sanhita (BNS) 2024. Punishment: ${data.punishment} Replaces ${data.oldIpc}. Read in Hindi, Tamil, English. Free AI legal consult.`;

  return {
    title,
    description,
    keywords: data.keywords.join(', '),
    authors: [{ name: 'NyayNow Legal Tech' }],
    alternates: {
      canonical: `${baseUrl}/bns/${sectionKey}`
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/bns/${sectionKey}`,
      siteName: 'NyayNow',
      locale: 'en_IN',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@NyayNow'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
function generateJsonLd(sectionKey, data) {
  const baseUrl = 'https://nyaynow.in';
  const canonicalUrl = `${baseUrl}/bns/${sectionKey}`;

  // Legislation schema
  const legislation = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    'name': data.title,
    'url': canonicalUrl,
    'legislationType': 'StatuteSection',
    'legislationJurisdiction': 'IN',
    'description': `${data.offense}. Punishment: ${data.punishment}`,
    'legislationLegalValue': 'DefinitiveValue',
    'inLanguage': 'en'
  };

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': data.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }))
  };

  // BreadcrumbList schema
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'NyayNow', 'item': baseUrl },
      { '@type': 'ListItem', 'position': 2, 'name': 'BNS Directory', 'item': `${baseUrl}/bns` },
      { '@type': 'ListItem', 'position': 3, 'name': data.shortTitle, 'item': canonicalUrl }
    ]
  };

  return [legislation, faqSchema, breadcrumb];
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function BnsSectionPage({ params }) {
  const sectionKey = params.section?.toLowerCase() || 'section-303';
  const data = SECTIONS_DB[sectionKey];
  const jsonLdScripts = data ? generateJsonLd(sectionKey, data) : [];

  return (
    <>
      {/* Inject JSON-LD structured data blocks */}
      {jsonLdScripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Client-side interactive component */}
      <BnsSectionClient sectionKey={sectionKey} data={data} />
    </>
  );
}
