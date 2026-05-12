# TrainMate — MVP local

App local de musculação + cardio básico, focado em extensibilidade. Sem deploy em cloud, sem autenticação, sem IA.

> Aluno = `studentId` selecionável na UI (ou via URL `/train/:studentId`).

## Stack
- **Monorepo** com npm workspaces: `shared/`, `backend/`, `frontend/`
- **Backend:** Node.js + Express + TypeScript + Prisma + Zod
- **Frontend:** React + TypeScript + Vite + Material UI + React Router + Recharts
- **DB:** PostgreSQL (Docker Compose, recomendado) **ou** SQLite (fallback)
- **Excel parser:** `xlsx`

## Pré-requisitos
- Node.js 20+
- npm 10+
- (Opcional) Docker Desktop, se você for usar PostgreSQL local via `docker compose`

## Setup rápido

```powershell
# 1) Instale as dependências (raiz)
npm install

# 2) (Opcional, recomendado) Suba o Postgres local
docker compose up -d

# 3) Configure o backend
cd backend
copy .env.example .env
# (Edite .env se quiser usar SQLite)

# 4) Gere o client Prisma e rode migrations
npm run prisma:generate
npm run prisma:migrate -- --name init

# 5) Seed (3 alunos demo + 1 sessão demo)
npm run seed

# 6) Volte para a raiz e suba backend + frontend juntos
cd ..
npm run dev
```

- Backend: http://localhost:4000 (`/api/health` deve retornar `{ ok: true }`)
- Frontend: http://localhost:5173

### Usando SQLite (sem Docker)
1. Em `backend/prisma/schema.prisma`, troque `provider = "postgresql"` por `provider = "sqlite"`.
2. Em `backend/.env`, use `DATABASE_URL="file:./dev.db"`.
3. Rode `npm run prisma:migrate -- --name init` dentro de `backend/`.

## Importando planilhas Excel

Coloque os arquivos em `data/` (ou em qualquer caminho acessível). Exemplo:

```powershell
# A partir da raiz
npm run import:excel -- --files "data/Julho2025.xlsx,data/setembro2025.xlsx,data/Novembro2025.xlsx,data/Janeiro2026.xlsx,data/Maio2026.xlsx"
```

O importador:
- Calcula `sha256` de cada arquivo
- Cria um `TrainingBlock` por `(sourceFile, sourceHash)` — re-import idempotente
- Lê abas `Amarelo/Verde/Vermelho/Laranja/Azul` e detecta seções "Semana" ou "Microciclo"
- Lê abas `Aeróbio` / `Cardiorrespiratório` como `CardioProtocol`
- Lê aba `Sistemas e Métodos` (linhas tipo `NOME: descrição`)
- Normaliza métodos (`Piram. Cresc.` → `Pirâmide crescente`, `DROP-SET` → `Drop-set`, etc.)

> Se o mesmo arquivo for reimportado, o bloco é reaproveitado (idempotente). Mudou o conteúdo → novo `sourceHash` → novo bloco (versão).

## Estrutura de pastas

```
trainerapp/
├── package.json (workspaces)
├── docker-compose.yml
├── docs/roadmap.md
├── shared/                # tipos + schemas Zod compartilhados
├── backend/
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── prisma.ts
│       ├── lib/normalize.ts
│       ├── routes/ (students, plans, sessions, cardio, progress)
│       └── scripts/import-excel.ts
└── frontend/
    └── src/
        ├── App.tsx, main.tsx, api.ts
        ├── components/ (Layout, StudentSelector)
        └── pages/ (Home, Students, Train, Cardio, Progress, Plans)
```

## API (resumo)

Base: `/api`

| Método | Rota | Descrição |
|---|---|---|
| GET  | `/students` | Listar alunos |
| POST | `/students` | Criar aluno `{ name, nickname? }` |
| GET  | `/plans/blocks` | Listar blocos importados |
| GET  | `/plans/blocks/:blockId` | Detalhes do bloco |
| GET  | `/plans/blocks/:blockId/days/:color/microcycles/:index` | Prescrição |
| POST | `/sessions` | Iniciar sessão (status `IN_PROGRESS`) |
| POST | `/sessions/:id/sets` | Adicionar set |
| POST | `/sessions/:id/finish` | Finalizar e calcular `totalLoadKg` e `arbitraryUnits = pse × duração` |
| POST | `/cardio` | Registrar cardio |
| GET  | `/cardio?studentId=...` | Histórico cardio |
| GET  | `/progress/total-load?studentId=` | Série temporal de carga total |
| GET  | `/progress/arbitrary-units?studentId=` | Série de UA |
| GET  | `/progress/exercise-load?studentId=&exercise=` | Evolução por exercício |
| GET  | `/progress/muscle-volume?studentId=` | Volume por grupo muscular |

## Scripts (raiz)
- `npm run dev` — backend + frontend juntos (concurrently)
- `npm run build` — build de tudo
- `npm run seed` — seeds no backend
- `npm run import:excel -- --files "..."` — importação Excel
- `npm run prisma:studio` — abre o Prisma Studio

## Roadmap
Veja [docs/roadmap.md](docs/roadmap.md).
