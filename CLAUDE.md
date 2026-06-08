# CLAUDE.md — Frontend Website Rules

## 1. Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## 2. Reference Images (The "Pixel-Perfect" Mandate)
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content only if assets are missing.
- **NEVER** improve, iterate, or add to a reference design. Your goal is transcription, not interpretation.
- If no reference image: design from scratch adhering strictly to the "Anti-Generic Guardrails" below.
- **The Self-Correction Loop:**
  1. Generate code.
  2. Screenshot output.
  3. Generate a strict "Visual Diff Report" comparing the screenshot to the reference. Be explicit (e.g., "H1 tracking is -0.05em, reference is tighter; Card gap is 1.5rem, reference is 2rem").
  4. Fix mismatches and re-screenshot.
  5. Perform at least 2 comparison rounds. Stop only when the diff report yields zero visible differences or the user halts the process.

## 3. Local Server & Screenshot Workflow
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start dev server: `node serve.mjs` (serves root at `http://localhost:3000`). Start this in the background before taking screenshots. Do not start a second instance if running.
- Puppeteer is at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`.
- **Screenshot command:** `node screenshot.mjs http://localhost:3000`
- **Labeled Screenshot:** `node screenshot.mjs http://localhost:3000 label` (saves as `screenshot-N-label.png`).
- Screenshots auto-save to `./temporary screenshots/`.
- After screenshotting, use the Read tool to analyze the image directly from that folder.

## 4. Output Architecture Defaults
- Output a single `index.html` file with inline styles unless specified otherwise.
- **Tailwind Setup:** Use the CDN (`<script src="https://cdn.tailwindcss.com"></script>`).
- **Tailwind Config:** Define custom brand colors, fonts, and extended shadows inside a `<script>` tag configuring `tailwind.config` to avoid arbitrary value bloat (e.g., avoid using `bg-[#ff3366]` repeatedly; define it as `theme.colors.brand.primary`).
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`.
- Use Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Mobile-first responsive design is mandatory.

## 5. Brand Assets
- Always check the `brand_assets/` folder before designing.
- If logos, color guides, or style guides exist there, they are immutable rules.
- Do not use placeholders where real assets are available in that folder.
- Do not invent brand colors if a palette is provided.

## 6. Anti-Generic Guardrails (High Craft Standards)
- **Colors:** Never use default Tailwind palettes (e.g., indigo-500, blue-600) as primary brand colors. Select a custom brand color and derive a coherent palette.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity (e.g., shadows that inherit the hue of the background).
- **Typography:** Pair a display/serif font with a clean sans-serif. Apply tight tracking (`tracking-tight` or `-0.03em`) on massive headings, and generous line-height (`leading-relaxed` or `1.7`) on body text.
- **Gradients & Texture:** Layer multiple radial gradients for backgrounds. When appropriate, add grain/texture via an SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. **Never use `transition-all`.** Use spring-style easing curves where possible.
- **Interactive States:** Every clickable element (buttons, links, cards) MUST have distinct `:hover`, `:focus-visible`, and `:active` states.
- **Images:** Apply a gradient overlay (`bg-gradient-to-t from-black/60`) for text legibility, and consider color treatments via `mix-blend-multiply` or `luminosity`.
- **Depth & Elevation:** Create a deliberate z-plane layering system (base -> elevated -> floating). Do not let all elements sit on the same visual plane.

## 7. Accessibility & Interactivity (a11y)
- All images must have meaningful `alt` text (or `alt=""` if purely decorative).
- Ensure sufficient color contrast between text and backgrounds.
- If adding vanilla JS for interactivity (e.g., mobile menus, modals), ensure focus trapping, escape key to close, and appropriate `aria-expanded`/`aria-hidden` attributes are toggled.

## 8. Absolute Hard Rules
- Do NOT add sections, features, or content not present in the reference.
- Do NOT "improve" a reference design — match it exactly.
- Do NOT stop the screenshot loop after one pass.
- Do NOT use `transition-all`.
- Do NOT use default Tailwind blue/indigo/purple as the primary brand color.

