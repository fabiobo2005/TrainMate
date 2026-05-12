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
- **Git** 2.40+
- **Node.js 20+ LTS** (vem com `npm` 10+)
- **Docker** (opcional, recomendado para Postgres local) — alternativa: SQLite
- Editor de código (VS Code recomendado)

---

## Instalação da stack

### 🪟 Windows 10/11

#### Opção A — Instaladores oficiais (mais simples)

1. **Git for Windows**
   - Baixe: <https://git-scm.com/download/win>
   - Use as opções padrão. Verifique:
     ```powershell
     git --version
     ```

2. **Node.js 20 LTS**
   - Baixe o instalador MSI (LTS): <https://nodejs.org/en/download>
   - Após instalar, abra um **novo** PowerShell e verifique:
     ```powershell
     node -v   # v20.x
     npm -v    # 10.x
     ```

3. **Docker Desktop** (opcional, recomendado)
   - Baixe: <https://www.docker.com/products/docker-desktop/>
   - Requer **WSL 2** habilitado. Se não tiver, rode em PowerShell **como Administrador**:
     ```powershell
     wsl --install
     ```
     Reinicie. Abra o Docker Desktop e aguarde inicializar. Verifique:
     ```powershell
     docker --version
     docker compose version
     ```

4. **(Opcional) GitHub CLI** — para clonar via `gh`:
   ```powershell
   winget install --id GitHub.cli
   gh auth login
   ```

#### Opção B — winget (linha de comando, mais rápido)

Em PowerShell:
```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Docker.DockerDesktop -e
winget install --id GitHub.cli -e
# Feche e reabra o terminal para atualizar o PATH
```

#### Opção C — Chocolatey

```powershell
# Em PowerShell como Administrador (instala o Choco se não tiver)
Set-ExecutionPolicy Bypass -Scope Process -Force; `
  iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install -y git nodejs-lts docker-desktop gh
```

---

### 🐧 Linux

#### Ubuntu / Debian

```bash
# Git
sudo apt update && sudo apt install -y git curl ca-certificates

# Node.js 20 LTS (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

# Docker Engine + Compose plugin
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permitir docker sem sudo (re-login depois)
sudo usermod -aG docker $USER

# (Opcional) GitHub CLI
sudo apt install -y gh   # ou: https://cli.github.com/
```

> Para outras distros (Debian puro, Pop!_OS, Mint), os comandos são equivalentes — apenas troque o repo `ubuntu` pelo `debian` no Docker quando aplicável.

#### Fedora / RHEL

```bash
sudo dnf install -y git curl
# Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Docker
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

#### Arch / Manjaro

```bash
sudo pacman -Syu --needed git nodejs npm docker docker-compose github-cli
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

#### Alternativa multiplataforma — `nvm` (recomendado para gerenciar versões do Node)

Linux/macOS:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Reabra o terminal
nvm install 20
nvm use 20
```

Windows: use [`nvm-windows`](https://github.com/coreybutler/nvm-windows/releases) ou `winget install CoreyButler.NVMforWindows`.

---

### ✅ Verificação rápida (Windows ou Linux)

```bash
git --version            # >= 2.40
node -v                  # v20.x
npm -v                   # >= 10
docker --version         # opcional
docker compose version   # opcional
```

---

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
