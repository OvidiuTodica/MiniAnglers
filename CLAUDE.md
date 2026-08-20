# CLAUDE.md — MiniAnglers Shopify Theme

## The business

MiniAnglers sells 3D-printed carp/method-feeder tackle organization products —
bait trays, wafter/pop-up holders, gel/dip jar holders — designed and shipped
from Romania. Prices in RON (lei). Site is bilingual, Romanian default with an
English toggle.

Registered entity: PFA Todica Ovidiu-Victor-Nicușor (CUI 52748161, Sat
Gavojdia, Jud. Timiș). Domain: minianglers.com. This data backs the legal
pages (`templates/page.confidentialitate.liquid`,
`page.termeni-si-conditii.liquid`, `page.retur-si-rambursare.liquid`,
`page.livrare.liquid`) and `snippets/ma-legal-block.liquid`. VAT/TVA status
not yet confirmed with an accountant — flag it if pricing/invoicing logic is
touched.

**Any fishing/water visual motif must be grounded in the real product line**
(bait trays, wafters, gel holders, a carp session) — not generic
fishing-industry imagery unrelated to what's actually sold. A sonar/fish-finder
concept was tried and explicitly rejected: "we don't sell sonars... we sell
bait boxes and things made with 3D printers." When in doubt: would this appear
in a real photo of a carp/method-feeder session with this product in it? If
not, it's too abstract/borrowed.

## Tech stack

Custom-coded Shopify theme — **no Dawn base, no build tooling, no Tailwind**.
Styles live in `assets/minianglers.css`. Standard Shopify theme layout:
`layout/`, `sections/`, `snippets/`, `templates/`, `config/`, `locales/`.
Current brand palette (from `config/settings_data.json`): dark background
`#0A0A0B`, teal accent `#4FD1C5`, text `#d7d7db`. Treat these as the real
brand colors, not placeholders to invent over.

Shopify CLI (`shopify`, v4.6+) is installed — `shopify theme dev` can serve a
live local preview bound to the actual store/theme when a real preview is
needed. There is no `serve.mjs` / `screenshot.mjs` / static `index.html` +
Tailwind-CDN setup in this repo — don't assume one exists.

## Deploy

Pushing to `origin/shopify-theme` auto-deploys to minianglers.com via
Shopify's GitHub integration, usually within a few minutes — no manual
Shopify CLI or Admin publish step needed. **Always commit and push after a
change looks right, without asking first** — this is a standing instruction.
Still flag it in the summary if something is unusually risky (e.g. touches
checkout). To verify a deploy, `curl` the live URL directly rather than
trusting a screenshot (screenshots can be stale-cached).

Branch layout:
- `shopify-theme` — the live, actively developed branch. Work here.
- `main` — an old pre-Shopify static-HTML prototype. Unrelated to the live store.
- `shopify-preview` — a stale snapshot frozen ~2026-06-21. Don't treat as current.

## Working with the owner

Ovidiu runs the store himself and isn't a developer. He often dictates
messages by voice (expect garbled transcripts — homophone errors, dropped
articles — read for intent, ask only if genuinely ambiguous). Prefer solutions
that reuse Shopify Admin screens he already knows (Description, Tags, Pages)
over ones requiring new Admin concepts (metafields, custom data) even when the
latter is technically cleaner. When an Admin step is unavoidable, give exact
numbered click-by-click instructions with literal copy-paste text.

## Design workflow

- **Invoke the `frontend-design` skill** before any frontend/visual work, every session.
- If a reference image is provided: match layout, spacing, typography, and
  color exactly; don't "improve" on it. Do at least 2 screenshot-compare
  rounds before calling it done.
- Anti-generic guardrails still apply on top of the brand palette above:
  layered/tinted shadows (not flat `shadow-md`), a real type pairing (not one
  font for everything), intentional spacing, animate only `transform`/`opacity`
  with real easing, hover/focus-visible/active states on every clickable
  element, a proper elevation system rather than everything on one plane.
