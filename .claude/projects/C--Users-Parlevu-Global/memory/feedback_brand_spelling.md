---
name: feedback-brand-spelling
description: "Brand is always written \"VoltixIO\" (capital IO) in any text — never \"Voltixio\"; URLs stay lowercase"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6b5ed18a-ea32-4e2f-9cfd-44c016daa067
---

The brand name is **VoltixIO** — capital V, capital IO. Never write "Voltixio" in titles, headings, logos, email copy, docs, or any user-facing text.

**Why:** User corrected this explicitly on 2026-07-17 ("thats the brand if its not a url — always write VoltixIO").

**How to apply:** Case-sensitive check for `Voltixio` before shipping any content. URLs/domains (voltixio.com, api.voltixio.com, tokens like `voltixio_blog_intake`) stay all-lowercase — do not "fix" those.

Related: [[project-voltixio-hosting]]
