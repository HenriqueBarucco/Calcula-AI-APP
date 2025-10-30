## Calcula AI App

Expo Router app for scanning price labels and calculating totals.

### Setup

1) Install deps

```bash
pnpm install
```

2) Configure environment

```bash
cp .env.example .env
# edit API_URL if needed
```

3) Run

```bash
pnpm start
```

Optional:

```bash
pnpm run android
pnpm run ios
pnpm run web
pnpm run typecheck
pnpm run lint
```

### Env

The file `app.config.ts` reads `.env` and exposes `extra.apiUrl`, consumed by `lib/config.ts` as `API_URL`.

### Structure

- `components/`: small reusable UI parts (cards, buttons, list items)
- `context/SessionContext.tsx`: session creation and state
- `lib/api.ts`: API calls
- `lib/config.ts`: runtime config (API_URL)
- `utils/currency.ts`: formatting helpers

