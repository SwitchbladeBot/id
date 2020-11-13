import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from 'i18next-browser-languagedetector'

// languages
import englishLang from './translation/en.json'
import portugueseLang from './translation/pt.json'

const resources = {}
const locales = [
  ['en', englishLang],
  ['pt', portugueseLang]
]

export const availableLocales = locales.map(l => l[0])

for (const [code, strings] of locales) {
  resources[code] = {
    translation: strings
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n