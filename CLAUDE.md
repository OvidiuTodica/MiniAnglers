# CLAUDE.md — MiniAnglers Shopify Theme

This file governs how Claude works in this repository. It reflects the
codebase as it actually exists — every path, token, and convention below was
verified against the current files, not assumed. If something here stops
matching the code, fix this file in the same commit that causes the drift.

---

## 1. Business context

**What MiniAnglers sells:** 3D-printed carp / method-feeder tackle
organization gear — bait trays, wafter/pop-up holders, gel and dip jar
holders — designed and printed in-house in Romania, sold in RON (lei).
Optional paid custom engraving (name, club, or team code) is a core product
differentiator; a standard MiniAnglers logo engrave is included free.

**Registered entity:**
- PFA Todica Ovidiu-Victor-Nicușor, CUI 52748161 (reg. 22.10.2025)
- Nr. Reg. Com. F2025041573009 · EUID ROONRC.F2025041573009
- Sediu profesional: Sat Gavojdia, Comuna Gavojdia, Nr. 368, Jud. Timiș
- CAEN: 3230 (sports goods manufacture), 3299 (other manufacture n.e.c.),
  4778 (retail of other new goods), 4791 (retail intermediation)
- VAT/TVA status: **not yet confirmed with an accountant.** Treat as open
  whenever pricing, invoicing, or checkout tax logic is touched — don't
  assume VAT-registered or VAT-exempt behavior either way.
- Domain: minianglers.com (live, deployed via this repo — see §5)

This data backs the legal pages and must stay in sync with them:
`templates/page.confidentialitate.liquid`, `page.termeni-si-conditii.liquid`,
`page.retur-si-rambursare.liquid`, `page.livrare.liquid`,
`snippets/ma-legal-block.liquid` (trader-identification block).

**Brand voice grounding rule:** every visual or copy motif touching
fishing/water imagery must trace back to a real MiniAnglers product or a real
carp/method-feeder session — the compartmentalized tray itself, boilies/pop-ups
sitting in it, a carp rolling on the surface, reeds at a bank, a session scene.
Generic fishing-industry imagery unrelated to what's actually sold (sonar/
fish-finder displays, generic lure/rod stock imagery, marina/deep-sea themes)
is off-limits — this was tried once, explicitly rejected by the owner ("we
don't sell sonars... we sell bait boxes and things made with 3D printers"),
and must not recur. Test: would this appear in a real photo of a session with
this product in frame? If not, it's too abstract.

---

## 2. Architecture

Custom-coded Shopify theme. **No Dawn base, no build step, no bundler, no
package manager, no Tailwind or any CSS framework.** Everything is
hand-written Liquid, vanilla JS, and one stylesheet. Do not introduce build
tooling, a `package.json`, or a framework without the owner explicitly asking
— it would break the "edit and push" simplicity the whole workflow depends on.

```
layout/theme.liquid          — single layout: head/SEO, font loading, section slots, script tags
sections/ma-*.liquid         — homepage/global sections (announce, header, hero, steps, features, products, footer)
snippets/ma-*.liquid         — reusable partials (icon sprite, legal block, legal nav)
templates/                   — page/product/collection/cart/search/404 templates + all legal pages
config/settings_schema.json  — theme editor settings definitions
config/settings_data.json    — current settings values, incl. brand color tokens
locales/en.default.json      — Shopify-required locale file (see §3 — NOT what drives on-page translation)
assets/minianglers.css       — the entire stylesheet, single file
assets/ma-i18n.js            — custom RO/EN toggle (see §3)
assets/ma-product.js         — product page logic (engraving config, variant/price updates)
assets/ma-cart.js            — cart drawer/line-item logic
assets/favicon.svg
```

**Naming convention:** every custom section, snippet, and JS asset carries an
`ma-` prefix (short for MiniAnglers) to distinguish it from anything a future
Dawn-based or third-party app injection might add. Keep new files consistent
with this — `ma-<purpose>.liquid` / `ma-<purpose>.js`.

**`layout/theme.liquid` is the single source of truth for:**
- SEO/meta pattern: canonical URL, title-with-fallback-to-shop-name, meta
  description (only rendered if `page_description` is set), full Open Graph
  block (site_name, type switches to `product` on PDPs, title, description,
  url, image at 1200px on product pages), Twitter summary_large_image card.
  Match this pattern for any new page type — don't skip OG tags on new
  templates.
- Font loading: Google Fonts preconnect + a single combined stylesheet link
  for Space Grotesk (display), Inter (body), JetBrains Mono (mono/labels) —
  see §4 for how these map to CSS tokens. Don't add another font without
  updating both this link and the `--font-*` tokens together.
- Script load order: `ma-i18n.js` → `ma-product.js` → `ma-cart.js`, all
  `defer`, all at the end of `<body>`. Preserve this order — `ma-product.js`
  and `ma-cart.js` both listen for the `ma:lang` event `ma-i18n.js` fires.
- Section slots: `ma-announce` and `ma-header` render before
  `content_for_layout`; `ma-footer` after. New global sections belong in this
  file; page-specific content belongs in `templates/`.

Shopify CLI (v4.6+) is installed on this machine. `shopify theme dev` gives a
real local preview bound to the live store/theme when one is genuinely
needed. There is no static-HTML/`index.html`/local Node server setup in this
repo — don't assume or recreate one.

---

## 3. Localization (RO default / EN toggle)

This is the single most important gotcha in the codebase — get it wrong and
translations silently don't apply.

**Romanian is rendered server-side as the default markup.** English is not
driven by Shopify's native `{{ 'key' | t }}` translation filters or
per-locale storefronts. Instead:

1. Any text that needs to switch languages gets a `data-i18n="section.key"`
   attribute in the Liquid template, with the **Romanian string as the actual
   rendered content**.
2. `assets/ma-i18n.js` holds a `DICT` object with `ro` and `en` sub-dictionaries
   keyed the same way (e.g. `'hero.line1'`, `'nav.shop'`, `'footer.tagline'`).
   On toggle, it swaps every `[data-i18n]` element's text against the chosen
   language, persists the choice (so it survives navigation), and fires a
   `ma:lang` custom event.
3. `ma-product.js` and `ma-cart.js` listen for `ma:lang` to re-render any
   dynamic strings they own (engraving config UI, cart line items) that
   aren't plain `[data-i18n]` nodes.
4. `locales/en.default.json` exists only because Shopify requires a locale
   file to be present — it is **not** the mechanism driving visible-page
   translation. Don't "fix" missing English text by editing this file; add or
   correct the matching key in `ma-i18n.js`'s `DICT.en`, and make sure the
   Liquid template has the `data-i18n` attribute pointing at it.
5. **Brand and product names are intentionally left untranslated** (e.g.
   "MiniAnglers", product line names) — don't add these to the dictionary.

When adding any new user-facing string: write the Romanian in the Liquid
template with `data-i18n="<namespace>.<key>"`, then add both `ro` and `en`
entries to `DICT` in `ma-i18n.js` under a comment grouping matching the
existing style (`// nav`, `// hero`, `// footer`, etc.).

---

## 4. Design system

**Aesthetic: "Blueprint Dark"** — dark navy background with a faint technical
grid overlay and a neon-blue/cyan accent system, monospace "instrument
readout" labels. This is a deliberate, already-chosen direction — don't drift
toward generic dark-mode SaaS styling or reintroduce an old teal/dark-navy
predecessor palette if you see it referenced anywhere stale.

**Tokens** (defined once in `:root`, `assets/minianglers.css` — always use
these, never hard-code a hex value inline):

| Token | Value | Use |
|---|---|---|
| `--bg` / `--bg2` / `--bg3` | `#070D16` / `#0A1422` / `#0C1A2E` | background layers, darkest → elevated |
| `--ink` | `#DCEBFF` | primary text |
| `--neon` | `#3DA5FF` | primary accent (buttons, links, focus) |
| `--cyan` | `#19E3FF` | secondary accent (labels, eyebrows, tags) |
| `--signal` | `#FFD23D` | sparing use — alerts/highlights only |
| `--mute` | `#7E94B4` | secondary/muted text |
| `--grid` / `--gridb` | rgba neon, low opacity | background grid lines |
| `--line` / `--line-soft` | rgba neon, low opacity | borders/dividers |
| `--glow` / `--shadow-glass` / `--shadow-float` / `--shadow-teal` | — | the only sanctioned shadow/glow treatments |
| `--r-sm/md/lg/xl` | 6/8/10/14px | border-radius scale |
| `--font-display` (Space Grotesk) / `--font-body` (Inter) / `--font-mono` (JetBrains Mono) | — | never pair headings and body in the same face |
| `--maxw` | 1200px | page/content max-width |

Legacy aliases (`--bg-0..4`, `--steel-*`, `--teal`, `--green-*`, `--coral`,
`--cream`) exist so old markup keeps working — **write new code against the
blueprint tokens (`--bg`, `--ink`, `--neon`, `--cyan`, `--mute`), not the
legacy aliases.**

**Established component patterns** — reuse, don't reinvent:
- `.eyebrow` — bordered mono-font uppercase label, cyan, used above headings
- `.glass-tag` — small pill tag, mono font, translucent background, subtle border
- `.mono` / `.muted` — utility text styles for instrument-style labels and dimmed text
- `.section` — centered max-width content wrapper (use this, not ad hoc containers)
- Body has a fixed technical grid background (`--grid` lines at 32px) and
  respects `prefers-reduced-motion` globally — any new animation must too.

**Anti-generic guardrails** (apply on top of the tokens above):
- Never introduce a color outside the token set above without the owner
  approving a palette change first.
- Shadows: use `--shadow-glass` / `--shadow-float` / `--glow` — never a flat
  default box-shadow.
- Typography: display face for headings only, body face for body only, mono
  face for labels/eyebrows/tags only — never mix.
- Animate only `transform` and `opacity`, never `transition: all`, and always
  respect `prefers-reduced-motion` (already wired globally — don't bypass it
  per-component).
- Every interactive element needs hover, focus-visible, and active states.
- Depth comes from the `--bg`/`--bg2`/`--bg3` layering + glow/shadow tokens,
  not from arbitrary opacity stacking.

---

## 5. Git & deploy workflow

**Push = deploy.** Shopify's GitHub integration watches `origin/shopify-theme`
directly; a push there is live on minianglers.com within a few minutes — no
Shopify CLI or Admin publish step involved.

**Always commit and push once a change looks right — do not stop to ask
"should I push this live?" first.** This is a standing instruction from the
owner after repeated back-and-forth confirming the same thing. Still call out
in the summary if a change is unusually risky (touches checkout, depends on
an unverified Shopify Admin data change) — just don't hold the push on it
unless something looks actually broken.

Write clear, descriptive commit messages as normal; this instruction removes
the confirmation step, not the care taken beforehand.

**Branches:**
| Branch | Status |
|---|---|
| `shopify-theme` | **The one to work on.** Live, connected to the deployed theme. |
| `main` | Old pre-Shopify static-HTML prototype. Unrelated to the live store — do not merge from or into it. |
| `shopify-preview` | Stale snapshot frozen ~2026-06-21, missing everything since. Don't treat as current or diff against it. |

**Verifying a deploy:** `curl` the live URL (or a specific `/pages/<handle>`)
directly rather than trusting a screenshot — screenshots can be cropped or
served from a stale cache. This has caught a real 404 that a screenshot alone
would have missed.

---

## 6. Working with the owner

Ovidiu runs the store himself; he is not a developer.

- He frequently dictates messages by voice. Expect garbled transcripts —
  homophone errors, stuttered or repeated words, dropped articles. Read for
  intent; ask only if something is genuinely ambiguous and consequential —
  don't guess on anything that's hard to undo.
- Prefer solutions built on Shopify Admin screens he already uses
  (Description field, Tags, Pages) over ones requiring new Admin concepts
  (metafields, custom data definitions) — even when the latter is the more
  "correct" engineering choice. He's found the Custom Data/metafields UI too
  complex even with step-by-step help.
- When an Admin step really is unavoidable, give exact numbered click-by-click
  instructions with literal copy-paste text — not a conceptual description of
  what to do.
- He'd rather hand over technical access (e.g. an Admin API token) than learn
  a new abstract concept himself — take that kind of offer seriously if it
  comes up.
- Feedback tends to be concrete and specific when something's wrong (see the
  sonar rejection in §1) — treat direct pushback as precise signal, not as
  something to soften or second-guess.

---

## 7. Design/frontend workflow

- **Invoke the `frontend-design` skill before any frontend or visual work**,
  every session, no exceptions.
- If a reference image is provided: match layout, spacing, typography, and
  color exactly — swap in placeholder content only if real content isn't
  available yet. Do not "improve" on a supplied reference.
- If no reference exists: design from scratch using §4's token system and
  guardrails, at the craft level they imply.
- Do at least two screenshot-compare rounds before calling visual work done;
  use `shopify theme dev` for a real preview against live theme data when
  screenshotting matters (see §2) — there is no local static-file preview
  server in this repo.
- Check both language states (RO default, EN via the toggle) before
  considering a UI change finished — a string missing its `data-i18n`
  wiring is a common regression (see §3).

---

## 8. Hard rules

- Do not add a build step, package manager, or CSS framework (Tailwind etc.)
  to this repo.
- Do not use Shopify's `{{ 'key' | t }}` filter or expect `locales/*.json` to
  drive visible-page translation — it doesn't here (see §3).
- Do not invent brand colors outside the token table in §4.
- Do not use generic/unrelated fishing imagery (sonar, deep-sea, generic
  stock lure imagery) — ground every motif in the real product line (§1).
- Do not hold a push waiting for "should I deploy this?" confirmation — push
  once it looks right (§5), flagging real risk in the summary instead.
- Do not default to Shopify metafields/custom-data solutions without
  considering the Description/Tags/Pages alternative first (§6).
- Do not treat `main` or `shopify-preview` as current — `shopify-theme` is
  the only live branch.
