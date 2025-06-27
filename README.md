# TrainMate

Um aplicativo moderno para acompanhamento de treinos e corridas, construído com Next.js, TypeScript e Tailwind CSS.

## Funcionalidades

- 🏋️ **Treinos Personalizados** - Exercícios organizados por grupos musculares
- 📊 **Acompanhamento de Progresso** - Monitore sua jornada fitness
- 🌍 **Multilíngue** - Suporte a Português, Inglês e Espanhol
- 🎨 **Design Moderno** - Interface energética e motivacional

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** para type safety
- **Tailwind CSS** para styling
- **next-intl** para internacionalização
- **ESLint** para qualidade de código

## Começando

Primeiro, execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

Você pode começar editando a página modificando `src/app/[locale]/page.tsx`. A página atualiza automaticamente conforme você edita o arquivo.

## Idiomas Suportados

- 🇧🇷 Português Brasileiro (padrão) - `/pt`
- 🇺🇸 English - `/en`
- 🇪🇸 Español - `/es`

## Estrutura do Projeto

```
src/
├── app/
│   ├── [locale]/          # Páginas internacionalizadas
│   │   ├── page.tsx       # Página inicial
│   │   ├── workouts/      # Página de treinos
│   │   └── layout.tsx     # Layout com locale
├── components/            # Componentes reutilizáveis
├── i18n/                 # Configuração de internacionalização
└── messages/             # Arquivos de tradução
    ├── pt.json          # Português
    ├── en.json          # Inglês
    └── es.json          # Espanhol
```

## Grupos de Exercícios

- **Pernas** - 8 exercícios incluindo agachamento, leg press, afundo
- **Costas** - 8 exercícios incluindo puxada frontal, remada, barra fixa
- **Peito** - 8 exercícios incluindo supino, flexão, crucifixo
- **Bíceps** - 8 exercícios incluindo rosca direta, martelo, concentrada
- **Tríceps** - 8 exercícios incluindo tríceps pulley, mergulho, francês
- **Cardio** - 8 exercícios incluindo esteira, HIIT, burpees

## Deploy

O jeito mais fácil de fazer deploy da sua aplicação Next.js é usar a [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) dos criadores do Next.js.

Consulte a [documentação de deployment do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.
