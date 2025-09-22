import React, { useState, useEffect, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: Toast = {
      id,
      duration: 5000,
      variant: 'default',
      ...toastData,
    }

    setToasts((prev) => [...prev, toast])

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-6 space-y-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const variantStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }

  const variantIcons = {
    default: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const variantIconColors = {
    default: 'text-gray-400',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }

  const Icon = variantIcons[toast.variant || 'default']

  return (
    <div
      className={`
        ${variantStyles[toast.variant || 'default']}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        transform transition-all duration-300 ease-in-out
        w-80 bg-white rounded-lg shadow-lg border p-4
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 ${variantIconColors[toast.variant || 'default']}`} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-medium text-gray-900">{toast.title}</p>
          )}
          {toast.description && (
            <p className="text-sm text-gray-500 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Export the standalone ToastProvider for use in App
// The ToastContainer is automatically included