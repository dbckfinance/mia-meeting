# Reikn

Privacy-first **local** AI meeting assistant for M&A workflows.  
Connected to [Reikn](https://reikn.com) for optional cloud sync.

## What it does

- Captures mic + system audio and transcribes **locally** (Whisper / Parakeet)
- Optional sync to Reikn cloud: structured M&A summary + Supercomputer handoff
- Toggle: stay 100% local, or send transcript to your Reikn account

## Relationship to Reikn Desktop (Electron)

| App | Role |
|-----|------|
| **Reikn** (this repo, Tauri) | Local-first capture + STT |
| **Reikn Desktop** ([m-ia](https://github.com/dbckfinance/m-ia)) | Assistant, Supercomputer, Deals, cloud Meetings |

## Prerequisites

- Rust (stable), Node.js 20+, pnpm
- Windows: Visual Studio Build Tools + (optional) CUDA/Vulkan for GPU
- See [BUILDING.md](docs/BUILDING.md)

## Quick start (dev)

```bash
# Install pnpm once (Windows) if missing:
npm install -g pnpm@9

cd frontend
pnpm install
cp .env.example .env.local   # fill NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY
pnpm tauri:dev               # or pnpm tauri:dev:cuda on NVIDIA
```

If PowerShell says `pnpm` is not recognized, close and reopen the terminal (PATH), or call:

```powershell
$env:Path += ";$env:APPDATA\npm"
pnpm tauri:dev
```

## Environment

```env
NEXT_PUBLIC_MIA_API_URL=https://www.m-ia.app
NEXT_PUBLIC_MIA_SUPABASE_URL=https://idlhouaracvkzqtklzbp.supabase.co
NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY=your_anon_key
```

## License

MIT — see [LICENSE.md](LICENSE.md) and [NOTICE](NOTICE).
