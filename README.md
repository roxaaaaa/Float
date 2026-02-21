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

## ElevenLabs Setup

1. Set these vars in `.env.local`:
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_AGENT_ID`
   - `ELEVENLABS_AGENT_PHONE_NUMBER_ID`
   - `ELEVENLABS_WEBHOOK_SECRET`
2. In ElevenLabs agent settings, configure Post-call Webhook URL:
   - `https://<your-domain>/api/calls/elevenlabs/webhook`
3. Use the same webhook signing secret value in ElevenLabs and `ELEVENLABS_WEBHOOK_SECRET`.
4. Keep `ELEVENLABS_ALLOW_SIMULATION=true` for local fallback, set `false` in production to force live errors.

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
- `POST /api/calls/elevenlabs/webhook`
- `POST /api/stripe/payment-link`
- `POST /api/invoices/upload`
