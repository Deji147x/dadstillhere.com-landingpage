---
name: project-voltixio-working-dirs
description: Two clones of voltixio-site exist; user wants new work in the Downloads copy
metadata: 
  node_type: memory
  type: project
  originSessionId: 6b5ed18a-ea32-4e2f-9cfd-44c016daa067
  modified: 2026-07-27T00:09:08.297Z
---

Two clones of github.com/Deji147x/voltixio-site exist — **they have diverged**:
- `C:\Users\Parlevu_Global\voltixio-site` (home copy) ← **in sync with origin/main; this is the live source of truth** (verified 2026-07-26)
- `C:\Users\Parlevu_Global\Downloads\voltixio-site` (Downloads copy) — user directed new files here 2026-07-16, but it fell 3 commits behind origin

Check `git rev-list --left-right --count origin/main...HEAD` in both before editing; don't assume the Downloads copy is current.

Other Voltixio repos: `voltixio-mcp` (Node MCP server, lead-gen tools), `techbrief.voltixio.com` (Next.js + Express backend, Prisma/Postgres — intake API lives at backend/src/routes/intake.ts).

VPS is CPU-only (2 vCPU / 8 GB RAM) — no GPU inference; gemma2:9b too heavy for it. LLM strategy: Groq primary, build.nvidia.com free credits fallback, drop or downsize local Ollama. Related: [[project_voltixio_website_restore]]
