# Roadmap — TrainMate

Backlog inspirado em apps fitness (Strava, Nike Training Club, Freeletics, MyFitnessPal). **Não implementado neste MVP.**

## Identidade e perfis
- Autenticação (email/senha, OAuth, SSO corporativo)
- Perfis: aluno, personal trainer, admin
- Vínculo aluno ↔ treinador, convites, permissões

## Biblioteca de exercícios
- Mídia (fotos/vídeos), descrição técnica
- Timers e cadência guiada (áudio/vibração)
- Variações, equipamentos alternativos, contraindicações

## Periodização e prescrição
- Periodização automática (linear, ondulatória, blocos)
- Progressões automáticas com base em RPE/PSE/PRs
- Deload programado, autoregulação por feedback do aluno
- Detecção e marcação de PRs (1RM, e1RM)

## Engajamento
- Metas, lembretes push, calendário, streaks
- Histórico social e compartilhamento (opt-in)
- Conquistas / gamificação

## Integrações
- Wearables: Apple Health, Google Fit, Garmin, Polar
- Importação de FCmax, HRV, sono
- Exportação PDF/Excel (programa + histórico)

## Bem-estar
- Nutrição, água, sono, check-ins diários
- Anamnese, antropometria e foto-progresso
- Avaliação física com gráficos

## Acessibilidade & internacionalização
- Multi-idioma (PT/EN/ES)
- Modo escuro, acessibilidade WCAG
- App mobile (React Native / Expo)

## IA (apenas roadmap)
- Sugestão de progressão de carga
- Detecção de overtraining a partir de PSE/UA/HRV
- Resumo automático de microciclo
- Assistente conversacional para aluno e treinador

## Operacional
- Logs/auditoria de alterações de prescrição
- Versionamento de programas (já temos `sourceHash`; expandir para diff visual)
- Backup/restore, exportação de dados do aluno
