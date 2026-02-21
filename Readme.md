# Float

Float is a B2B AI CFO app built with Next.js 14, Supabase, Claude, Stripe, Twilio, ElevenLabs, and Gemini.

## Local Setup

1. Install deps:
   - `pnpm install`
2. Copy env template:
   - `cp .env.example .env.local` (PowerShell: `Copy-Item .env.example .env.local`)
3. Fill required API keys in `.env.local`.
4. Run the app:
   - `pnpm dev`

## Supabase

1. Apply migrations in `supabase/migrations/`.
2. Enable realtime for:
   - `invoices`, `incidents`, `calls`, `ai_insights`, `cashflow_projections`, `chat_messages`
3. Create private storage bucket:
   - `invoice-uploads`
4. Deploy edge functions:
   - `supabase/functions/stripe-webhook`
   - `supabase/functions/monzo-webhook`

## Core Routes

- `/onboarding`
- `/dashboard`
- `/chat`
- `/calls`
- `/incidents`

## API Routes

- `GET /api/monzo/auth`
- `GET /api/monzo/callback`
- `GET /api/monzo/transactions`
- `GET /api/monzo/balance`
- `POST /api/claude/analyze`
- `POST /api/claude/chat` (SSE)
- `POST /api/calls/initiate`
- `POST /api/stripe/payment-link`
- `POST /api/invoices/upload`
