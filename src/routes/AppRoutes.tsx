import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { AuthPage } from '../pages/AuthPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProjectSelectionPage } from '../pages/ProjectSelectionPage'
import { Layout } from '../components/layout/Layout'

export function AppRoutes() {
  const { user, loading, profile } = useAuth()

  console.log('🛣️ AppRoutes: Rendering with state:', { user: !!user, loading, profile: !!profile })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando autenticação...</p>
          <p className="mt-2 text-sm text-gray-500">
            {user ? `Usuário: ${user.email}` : 'Verificando sessão...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProjectSelectionPage />} />
        <Route path="/projects" element={<ProjectSelectionPage />} />
        <Route path="/project/:projectId/board/:boardId" element={<DashboardPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}