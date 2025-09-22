import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getCurrentLanguage, setLanguage, t } from '../lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setCurrentLanguage] = useState<Language>(getCurrentLanguage())

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setCurrentLanguage(newLanguage)
  }

  const translate = (key: string) => t(key, language)

  useEffect(() => {
    // Listen for language changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue) {
        setCurrentLanguage(e.newValue as Language)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleLanguageChange,
        t: translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}