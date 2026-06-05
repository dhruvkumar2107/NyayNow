'use client'

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import ta from "../locales/ta.json";
import te from "../locales/te.json";
import kn from "../locales/kn.json";
import mr from "../locales/mr.json";

const translations = { en, hi, ta, te, kn, mr };

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState("en");

    useEffect(() => {
        const storedLang = localStorage.getItem("nyaynow_lang");
        if (storedLang && translations[storedLang]) {
            setLanguageState(storedLang);
        }
    }, []);

    const setLanguage = (lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
            localStorage.setItem("nyaynow_lang", lang);
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
