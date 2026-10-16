<div align="center">

# Pingo de Meio

**Sistema de gestão para um pequeno negócio de alimentos: PDV, pedidos, fichas técnicas, estoque e clientes consignados.**

🇺🇸 [Read in English](README.md)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

</div>

## Sobre

App full-stack em Next.js feito para um pequeno negócio real. Substitui planilhas no controle das vendas do dia, do custo de produção e das contas das lojas que revendem os produtos em consignação. Front e API rodam no mesmo processo Next.js.

## Funcionalidades

- PDV e "vendas do dia" com exportação
- Pedidos com status de pagamento e cliente
- Produtos com ficha técnica (ingredientes e custo)
- Estoque, despesas, retiradas e visão financeira
- Clientes consignados: entregas, vendas, acertos e preço por cliente
- Tarefas, agenda e calendário

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router + Route Handlers), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (Base UI), Lucide |
| Dados | MySQL + Prisma (17 versioned migrations) |
| Autenticação | Single-account login with signed httpOnly cookie |

## Arquitetura

```
app/(app)/   páginas autenticadas (pdv, pedidos, produtos, estoque, financeiro, clientes...)
app/api/     Route Handlers REST por recurso
app/login/   página de login
lib/         cliente Prisma, auth e utilitários
prisma/      schema, migrations e seed
proxy.ts     redireciona páginas sem sessão para /login
```

## Como rodar

**Pré-requisitos:** Node.js 20+, MySQL 8

```bash
npm install
# crie o .env com as variáveis abaixo
npx prisma migrate deploy
npm run db:seed
npm run dev        # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL |
| `AUTH_USERNAME / AUTH_PASSWORD` | Credenciais da conta única do sistema |
| `AUTH_SECRET` | Segredo que assina o cookie de sessão |

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build / npm start` | Build e servidor de produção |
| `npm run db:seed` | Dados iniciais |
| `npm run db:studio` | Prisma Studio |

## Equipe

- [Vinicius do Valle](https://github.com/vallevinicius)
