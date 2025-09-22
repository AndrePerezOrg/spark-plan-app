import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from './Button'

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return actualTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  const getTooltip = () => {
    if (theme === 'light') return 'Switch to dark mode'
    if (theme === 'dark') return 'Switch to system theme'
    return 'Switch to light mode'
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={cycleTheme}
      className="p-2 h-9 w-9"
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  )
}