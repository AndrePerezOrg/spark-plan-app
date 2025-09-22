# BIX Kanban Ideas

Uma plataforma de Kanban colaborativa para gerenciar ideias inovadoras, desenvolvida para o Hackathon BIX IA.

## 🚀 Funcionalidades

- **Kanban Interativo**: Arraste e solte cards entre colunas de workflow
- **Colaboração em Tempo Real**: Atualizações instantâneas para todos os usuários
- **Sistema de Votação**: Vote nas melhores ideias
- **Comentários**: Discussão colaborativa em cada ideia
- **Busca e Filtros**: Encontre ideias por título, descrição, prioridade ou criador
- **Tags**: Organize ideias com etiquetas personalizadas
- **Autenticação**: Sistema seguro com Supabase Auth

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** com TypeScript
- **Vite** para bundling e desenvolvimento
- **Tailwind CSS** para estilização
- **TanStack Query** para gerenciamento de estado servidor
- **@dnd-kit** para drag-and-drop
- **React Router** para navegação
- **date-fns** para formatação de datas

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)** para segurança
- **Realtime subscriptions** para colaboração

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker (para desenvolvimento local com Supabase)
- Conta no Supabase (para produção)

## 🔧 Instalação

### Desenvolvimento Local (Recomendado)

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd kanban_dashboard
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Supabase Local**
   ```bash
   # Inicie o Supabase local (Docker necessário)
   npx supabase start

   # Aplique as migrações do banco
   npx supabase db reset

   # Inicie as Edge Functions (em outra aba/terminal)
   npx supabase functions serve --no-verify-jwt
   ```

4. **Configure as variáveis de ambiente para local**
   ```bash
   # O arquivo .env.local já está configurado para desenvolvimento local
   # Ele usa as credenciais padrão do Supabase local
   ```

5. **Crie um super usuário**
   ```bash
   # Criar usuário administrador para testes
   ./scripts/create-super-user-final.sh admin@bix.com minha_senha
   ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

   A aplicação estará disponível em `http://localhost:8080` e o Supabase local em `http://127.0.0.1:54321`

### Desenvolvimento com Supabase Cloud

1. **Siga os passos 1-2 acima**

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configure o banco de dados**
   Execute os seguintes comandos SQL no Supabase SQL Editor conforme documentado no arquivo `lovable_kanban_prompt.md`.

4. **Inicie o servidor**
   ```bash
   npm run dev
   ```

## 🐳 Comandos Supabase Local

```bash
# Iniciar Supabase local
npx supabase start

# Parar Supabase local
npx supabase stop

# Verificar status
npx supabase status

# Reset do banco (aplica migrações)
npx supabase db reset

# Iniciar Edge Functions
npx supabase functions serve --no-verify-jwt

# Acessar o Studio local
# http://127.0.0.1:54323
```

## 🔧 Edge Functions

O projeto inclui Edge Functions para operações avançadas:

**Functions disponíveis:**
- `get-cards-with-counts` - Retorna cards com contadores de votos/comentários
- `reorder-card` - Reordena cards nas colunas

**URLs locais:**
- `http://127.0.0.1:54321/functions/v1/get-cards-with-counts`
- `http://127.0.0.1:54321/functions/v1/reorder-card`

**Para desenvolvimento:**
```bash
# Servir functions localmente
npx supabase functions serve --no-verify-jwt

# Deploy para produção
npx supabase functions deploy get-cards-with-counts
npx supabase functions deploy reorder-card
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── kanban/         # Componentes do Kanban
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes UI reutilizáveis
├── contexts/           # Context providers
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── routes/             # Configuração de rotas
└── types/              # Definições TypeScript
```

## 🎯 Fluxo de Trabalho

1. **Backlog**: Novas ideias são criadas aqui
2. **Em Análise**: Ideias sendo avaliadas pela equipe
3. **Aprovado**: Ideias aprovadas para implementação
4. **Implementado**: Ideias que foram desenvolvidas

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- Validação de permissões no frontend e backend
- Sanitização de inputs do usuário

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
# Deploy para Vercel
```

### Manual
```bash
npm run build
# Upload da pasta dist/ para seu servidor
```

## 📊 Arquitetura

O projeto segue os princípios definidos no hackathon:

### Backend (Supabase)
- **Modelagem Relacional**: Entidades User Profiles, Boards, Columns, Cards, Votes, Comments
- **Normalização**: Evita redundância de dados com relacionamentos adequados
- **Controle de Acesso**: RLS policies implementadas seguindo princípio do menor privilégio
- **Lógica Atômica**: Operações complexas tratadas de forma segura no backend

### Frontend (React)
- **Componentização**: Componentes modulares e reutilizáveis
- **Separação de Responsabilidades**: Hooks customizados para lógica de API
- **Estado Reativo**: TanStack Query com subscriptions em tempo real
- **Interface Intuitiva**: UX completa com board, formulários e autenticação

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Desenvolvido para o **BIX IA Hackathon: Kanban de Ideias**

---

**Transformando ideias em realidade** 💡✨
