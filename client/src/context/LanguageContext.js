'use client'

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import ta from "../locales/ta.json";
import te from "../locales/te.json";
import kn from "../locales/kn.json";
import mr from "../locales/mr.json";
import bn from "../locales/bn.json";
import gu from "../locales/gu.json";
import pa from "../locales/pa.json";
import ml from "../locales/ml.json";
import or from "../locales/or.json";
import as from "../locales/as.json";
import ur from "../locales/ur.json";
import sa from "../locales/sa.json";

const translations = { en, hi, ta, te, kn, mr, bn, gu, pa, ml, or, as, ur, sa };

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState("en");

    useEffect(() => {
        // Create google_translate_element container if it doesn't exist
        let container = document.getElementById('google_translate_element');
        if (!container) {
            container = document.createElement('div');
            container.id = 'google_translate_element';
            container.style.display = 'none';
            document.body.appendChild(container);
        }

        // Initialize Google Translate Script
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,ta,te,kn,mr,bn,gu,pa,ml,or,as,ur,sa',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            };
        }

        // Restore language from localStorage
        const storedLang = localStorage.getItem("nyaynow_lang");
        if (storedLang && translations[storedLang]) {
            setLanguageState(storedLang);
            
            // Wait for google translate select dropdown to render, then change it
            const interval = setInterval(() => {
                const select = document.querySelector('.goog-te-combo');
                if (select) {
                    select.value = storedLang;
                    select.dispatchEvent(new Event('change'));
                    clearInterval(interval);
                }
            }, 300);
            
            setTimeout(() => clearInterval(interval), 10000);
        }
    }, []);

    const setLanguage = (lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
            localStorage.setItem("nyaynow_lang", lang);
        }

        // Trigger Google Translate dropdown
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
        }
    };

    // Translator helper
    const t = (keyPath) => {
        const keys = keyPath.split(".");
        let translation = translations[language];

        for (const key of keys) {
            if (translation && translation[key] !== undefined) {
                translation = translation[key];
            } else {
                // Fallback to English
                let fallback = translations["en"];
                for (const fallbackKey of keys) {
                    if (fallback && fallback[fallbackKey] !== undefined) {
                        fallback = fallback[fallbackKey];
                    } else {
                        return keyPath; // return key if not found anywhere
                    }
                }
                return fallback;
            }
        }
        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
