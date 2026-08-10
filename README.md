# M&IA Meeting

Privacy-first **local** AI meeting assistant for M&A workflows.  
Fork of [Meetily](https://github.com/Zackriya-Solutions/meetily) (MIT) — rebranded and connected to [M&IA](https://www.m-ia.app).

## What it does

- Captures mic + system audio and transcribes **locally** (Whisper / Parakeet)
- Optional sync to M&IA cloud: structured M&A summary + Supercomputer handoff
- Toggle: stay 100% local, or send transcript to your M&IA account

## Relationship to M&IA Desktop (Electron)

| App | Role |
|-----|------|
| **M&IA Meeting** (this repo, Tauri) | Local-first capture + STT |
| **M&IA Desktop** ([m-ia](https://github.com/dbckfinance/m-ia)) | Assistant, Supercomputer, Deals, cloud Meetings |

## Prerequisites

- Rust (stable), Node.js 20+, pnpm
- Windows: Visual Studio Build Tools + (optional) CUDA/Vulkan for GPU
- See upstream [BUILDING.md](docs/BUILDING.md)

## Quick start (dev)

```bash
cd frontend
pnpm install
cp .env.example .env.local   # Supabase anon + M&IA API URL
pnpm tauri:dev               # or pnpm tauri:dev:cuda on NVIDIA
```

## Environment

```env
NEXT_PUBLIC_MIA_API_URL=https://www.m-ia.app
NEXT_PUBLIC_MIA_SUPABASE_URL=https://idlhouaracvkzqtklzbp.supabase.co
NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY=your_anon_key
```

## License

MIT — see [LICENSE.md](LICENSE.md) and [NOTICE](NOTICE).
