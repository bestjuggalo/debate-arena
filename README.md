# Debate Arena — AI vs AI

Submit any topic. Two AI agents craft the strongest arguments — one FOR, one AGAINST. Then you vote.

## Quick Start

```bash
cd debate-arena
npm install    # or: pnpm install
npm run dev    # starts on http://localhost:3000
```

## Architecture

- **Next.js 16** (App Router) with TypeScript and Tailwind CSS
- **In-memory database** for local development (swap to Prisma + PostgreSQL for production)
- **Mock AI generation** returns pre-written arguments after a delay (swap to Anthropic Claude for production)

## Project Structure

- `app/` — Pages and API routes
- `components/` — React UI components
- `lib/` — Database, AI generation, moderation, utilities

## Production Upgrades

1. Replace `lib/prisma.ts` with real Prisma client + PostgreSQL/Supabase
2. Replace `lib/anthropic.ts` with real Anthropic Claude API calls
3. Replace `lib/moderation.ts` with Claude Haiku moderation
4. Add `vercel.json` for deployment config
