import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, Users, Target, TrendingUp } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      // Redirect authenticated users
      window.location.href = from;
    }
  }, [user, from]);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, displayName);
      }

      if (result.error) {
        toast({
          title: 'Erro',
          description: isLogin 
            ? 'Email ou senha incorretos. Tente novamente.' 
            : 'Erro ao criar conta. Verifique os dados e tente novamente.',
          variant: 'destructive',
        });
      } else if (!isLogin) {
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar a conta (se necessário) e faça login.',
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Algo deu errado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-hero">
      {/* Left Side - Branding */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">BIX Kanban Ideas</h1>
            <p className="text-xl opacity-90">Transformando ideias em realidade</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start gap-3 glass p-4 rounded-lg">
              <Users className="w-6 h-6 mt-1 text-white/80" />
              <div>
                <h3 className="font-semibold">Colaboração em Tempo Real</h3>
                <p className="text-sm opacity-80">Trabalhe em equipe de forma sincronizada</p>
              </div>
            </div>
            <div className="flex items-start gap-3 glass p-4 rounded-lg">
              <Target className="w-6 h-6 mt-1 text-white/80" />
              <div>
                <h3 className="font-semibold">Organize Ideias</h3>
                <p className="text-sm opacity-80">Do conceito à implementação</p>
              </div>
            </div>
            <div className="flex items-start gap-3 glass p-4 rounded-lg">
              <TrendingUp className="w-6 h-6 mt-1 text-white/80" />
              <div>
                <h3 className="font-semibold">Vote nas Melhores</h3>
                <p className="text-sm opacity-80">Sistema de votação colaborativo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="lg:w-96 flex items-center justify-center p-8">
        <Card className="w-full max-w-sm glass border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Entre para acessar o quadro de ideias' 
                : 'Crie sua conta para começar a colaborar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                    required={!isLogin}
                    className="bg-white/50"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="bg-white/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-white/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? 'Entrando...' : 'Criando...'}
                  </>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-foreground/80 hover:text-foreground"
              >
                {isLogin 
                  ? 'Não tem conta? Criar uma' 
                  : 'Já tem conta? Entrar'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}