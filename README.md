# 📊 Dashboard Admin - Maná Financeiro

Dashboard administrativo para monitoramento do Maná Financeiro.

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:
```env
VITE_API_URL=https://manafinanceirov2.onrender.com
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 4. Build para produção

```bash
npm run build
```

## 📦 Deploy no Vercel

### Via CLI

```bash
npm install -g vercel
vercel
```

### Via GitHub

1. Conecte o repositório no Vercel
2. Configure a variável de ambiente `VITE_API_URL`
3. Deploy automático!

## 🔐 Autenticação

O dashboard usa autenticação via JWT. A senha é configurada no backend via variável `ADMIN_PASSWORD`.

## 📱 Páginas

- **Dashboard** - Visão geral com métricas principais
- **Usuários** - Lista de usuários com filtros
- **Lançamentos** - Métricas de entries
- **Sistema** - Monitoramento de infraestrutura
- **Códigos Beta** - Gerenciamento de códigos de acesso

## 🛠️ Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- Recharts (gráficos)
- TanStack Query (data fetching)
- Lucide React (ícones)
- date-fns (datas)

## 📁 Estrutura

```
src/
├── components/
│   ├── Layout.tsx      # Layout com sidebar
│   └── MetricCard.tsx  # Card de métrica
├── pages/
│   ├── Login.tsx       # Tela de login
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Users.tsx       # Lista de usuários
│   ├── Entries.tsx     # Métricas de lançamentos
│   ├── System.tsx      # Monitoramento
│   └── BetaCodes.tsx   # Códigos beta
├── services/
│   └── api.ts          # Chamadas à API
├── App.tsx             # Router principal
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## 🔗 Endpoints da API

O dashboard consome os seguintes endpoints:

- `POST /admin/login` - Autenticação
- `GET /admin/verify` - Verificar token
- `GET /admin/metrics/overview` - Métricas gerais
- `GET /admin/metrics/users` - Métricas de usuários
- `GET /admin/metrics/commands` - Comandos populares
- `GET /admin/metrics/entries` - Métricas de entries
- `GET /admin/metrics/system` - Métricas do sistema
- `GET /admin/users` - Lista de usuários
- `GET /admin/beta-codes` - Lista de códigos
- `POST /admin/beta-codes/generate` - Gerar códigos
