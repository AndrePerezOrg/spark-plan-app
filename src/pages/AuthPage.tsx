import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Lightbulb, Users, Target, TrendingUp } from 'lucide-react'
import { useToast } from '../components/ui/Toaster'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
          variant: 'success',
        })
      } else {
        await signUp(email, password, displayName)
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar a conta.',
          variant: 'success',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Algo deu errado. Tente novamente.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full">
            <Lightbulb className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            BIX Kanban Ideas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Transformando ideias em realidade
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Users className="w-5 h-5 mt-1 text-indigo-600" />
            <div>
              <h3 className="font-medium text-gray-900">Colaboração em Tempo Real</h3>
              <p className="text-sm text-gray-600">Trabalhe em equipe de forma sincronizada</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Target className="w-5 h-5 mt-1 text-indigo-600" />
            <div>
              <h3 className="font-medium text-gray-900">Organize Ideias</h3>
              <p className="text-sm text-gray-600">Do conceito à implementação</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <TrendingUp className="w-5 h-5 mt-1 text-indigo-600" />
            <div>
              <h3 className="font-medium text-gray-900">Vote nas Melhores</h3>
              <p className="text-sm text-gray-600">Sistema de votação colaborativo</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${
                isLogin
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${
                !isLogin
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Nome"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}