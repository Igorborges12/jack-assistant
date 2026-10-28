# Jack — Assistente Pessoal Inteligente

**Uma plataforma Full Stack para centralizar atividades, automatizar processos e organizar a vida profissional, acadêmica e pessoal.**

**Status:** Em desenvolvimento ativo  
**Desenvolvedor:** Igor Borges Rocha

## Sobre o projeto

O Jack é um assistente pessoal inteligente desenvolvido para reunir diferentes áreas da rotina em uma única plataforma.

O objetivo é reduzir tarefas repetitivas, facilitar a tomada de decisões e automatizar processos relacionados à carreira, estudos, comunicação e organização pessoal.

A aplicação utiliza React e TypeScript no frontend, Python com FastAPI no backend e MySQL para persistência dos dados.

O projeto também prevê a utilização de inteligência artificial para análise de informações, recomendações e automação de tarefas, mantendo o usuário no controle das ações importantes.

## Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| Banco de dados | MySQL, SQLAlchemy |
| Autenticação | JWT, PasswordHash |
| Navegação | TanStack Router |
| Integrações | APIs REST |
| Ferramentas | Git, GitHub, VS Code, Lovable |

## Funcionalidades do Jack

### Career — Gerenciamento de carreira

- Cadastro e gerenciamento de oportunidades profissionais
- Classificação de vagas por pontuação de compatibilidade
- Organização de candidaturas
- Preferências de busca de vagas
- Busca automatizada de oportunidades
- Recomendações de vagas com base no perfil profissional
- Acompanhamento do processo seletivo
- Histórico de candidaturas

### Email — Gerenciamento de e-mails

- Centralização da caixa de entrada
- Classificação e organização de mensagens
- Geração de sugestões de respostas
- Identificação de mensagens prioritárias
- Preparação de rascunhos
- Envio de mensagens mediante aprovação

### Study — Organização acadêmica

- Gerenciamento de disciplinas e atividades
- Organização de materiais de estudo
- Planejamento de sessões de estudo
- Geração de resumos
- Acompanhamento de progresso acadêmico
- Assistência com conteúdos e exercícios

### Agenda — Organização pessoal

- Gerenciamento de compromissos
- Cadastro de tarefas e eventos
- Planejamento de atividades
- Integração planejada com calendários externos
- Lembretes e notificações

### Chat — Assistente inteligente

- Interface conversacional
- Centralização de comandos e solicitações
- Consulta de informações dos módulos
- Interação contextual com o assistente
- Planejamento de ações automatizadas

### Approvals — Sistema de aprovações

- Centralização de ações pendentes
- Revisão de operações propostas
- Aprovação ou rejeição de ações
- Controle humano sobre automações sensíveis

### Dashboard — Painel principal

- Visão geral das atividades
- Resumo de oportunidades profissionais
- Visualização de tarefas e compromissos
- Indicadores de acompanhamento
- Navegação integrada entre os módulos

## Arquitetura do sistema

O Jack utiliza uma arquitetura Full Stack dividida em frontend, backend e banco de dados.

**Frontend:** interface desenvolvida em React e TypeScript, responsável pela navegação, apresentação das informações e comunicação com as APIs.

**Backend:** API REST desenvolvida com FastAPI, responsável pela autenticação, regras de negócio e processamento de dados.

**Banco de dados:** MySQL, integrado por meio do SQLAlchemy para armazenamento e gerenciamento das informações.

**Segurança:** autenticação JWT, senhas protegidas por hash e utilização de variáveis de ambiente para credenciais.

## Estrutura do projeto

```text
pixel-perfect/
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── db/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       └── main.py
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   └── types/
├── package.json
└── README.md
```

## Status de desenvolvimento

| Funcionalidade | Status |
|---|---|
| Interface responsiva | Implementada |
| Login e autenticação JWT | Implementada |
| API REST com FastAPI | Implementada |
| Integração com MySQL | Implementada |
| Cadastro e gerenciamento de vagas | Implementada |
| Classificação de vagas por compatibilidade | Implementada |
| Estrutura dos módulos principais | Implementada |
| Automação completa de busca de vagas | Em desenvolvimento |
| Integração com e-mails reais | Planejada |
| Integração com calendários externos | Planejada |
| Assistente conversacional com IA | Em desenvolvimento |
| Automação de estudos | Planejada |
| Fluxos completos de aprovação | Em desenvolvimento |

Os status representam o estágio geral do projeto. Algumas funcionalidades implementadas ainda podem exigir melhorias, testes ou integração completa com a interface.

## Objetivos futuros

O desenvolvimento do Jack busca evoluir a plataforma para um assistente capaz de executar fluxos de trabalho completos, integrar serviços externos e oferecer recomendações personalizadas.

Entre as próximas etapas estão a expansão das automações, a integração com provedores externos, a evolução do assistente conversacional e a implementação de testes automatizados.

## Autor

**Igor Borges Rocha**

Estudante de Análise e Desenvolvimento de Sistemas, com interesse em desenvolvimento Full Stack, análise de dados, inteligência artificial e automação.

**GitHub:** https://github.com/Igorborges12

**Repositório:** https://github.com/Igorborges12/pixel-perfect

---

*Jack é um projeto pessoal desenvolvido para aprendizado prático, experimentação tecnológica e construção de portfólio profissional.*