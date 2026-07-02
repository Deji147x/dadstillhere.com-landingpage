---
name: dry-run approval required
description: Never flip DRY_RUN=false without explicit user approval
type: feedback
---

Never set DRY_RUN=false in voltixio-mcp/.env without explicit approval from the user.

**Why:** User stopped this action — going live requires a deliberate sign-off, not an automatic step during setup.

**How to apply:** When finishing voltixio-mcp setup or any similar automation server, always leave DRY_RUN=true and prompt the user to approve before flipping it live.
