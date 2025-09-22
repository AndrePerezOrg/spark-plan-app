import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Lightbulb, LogOut, User, Menu, X, Globe } from 'lucide-react'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    console.log('🔥 Sign out button clicked!')
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">BIX Kanban Ideas</h1>
              <p className="text-xs text-muted-foreground">Hackathon de Ideias</p>
            </div>
          </div>

          {/* Theme Toggle, Language Toggle & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language === 'pt-BR' ? 'PT' : 'EN'}</span>
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  console.log('🔥 User dropdown toggle clicked!')
                  setDropdownOpen(!dropdownOpen)
                }}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="hidden md:block font-medium text-foreground">
                  {profile?.display_name || user?.email}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.display_name || t('user.defaultName')}
                    </p>
                    <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('auth.signOut')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}