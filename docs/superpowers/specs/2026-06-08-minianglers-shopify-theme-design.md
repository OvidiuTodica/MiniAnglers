# MiniAnglers Shopify Theme — Design Spec

**Date:** 2026-06-08
**Status:** Approved design, pre-implementation
**Owner:** Ovidiu Todica

## Summary

Convert the existing MiniAnglers React prototype (`MiniAnglers Website.html`) into a
production Shopify storefront as a **custom Liquid theme**. The prototype is a polished,
dark, glassmorphism homepage with a personalization configurator but has no real backend
(cart is a counter, products are hardcoded, no checkout). Shopify supplies the missing
commerce layer (products, cart, checkout, payments, taxes, shipping); this project supplies
the on-brand storefront.

The brand: **MiniAnglers — "Modular Tackle System"**. 3D-printed-in-house, UK-made,
personalized bait boxes and wafter supports for method-feeder fishing. GBP pricing.
Tagline: *"Sealed. Mounted. Etched."*

## Goals

- Homepage that pixel-matches the prototype, running on real Shopify products.
- Working cart + checkout via Shopify.
- Engraving personalization captured on orders.
- Brand design tokens applied theme-wide so all pages feel coherent.

## Non-Goals (round one)

- Fully custom-styled product / collection / cart pages (use restyled Dawn templates).
- Advanced configurator (bay-count / finish picker), search page, blog, reviews, analytics.
- Headless / Hydrogen / React runtime. (Rejected: too much complexity for this interactivity.)

## Approach Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Platform path | Custom Liquid theme | Native cart/checkout/SEO, least complexity vs Hydrogen |
| Base | **Fork Dawn** (Shopify reference theme) | Free product/cart/collection templates, AJAX cart, a11y, SEO |
| Scope | Homepage-first, brand-everywhere | Ship a working on-brand store fast; polish inner pages in round two |
| Engraving | Line item properties (`properties[Engraving]`) | Free, captured on order, no variant explosion |
| Pricing currency | GBP (£) | Matches prototype |

## Architecture

```
theme/
├── assets/        minianglers.css (ported design system), configurator.js
├── sections/      ma-hero, ma-products, ma-configurator, ma-footer (custom)
├── snippets/      brand-tokens, icons (Lucide SVGs from prototype)
├── templates/     index.json (homepage); product/cart/collection = Dawn, restyled
└── config/        settings_schema (brand colors + fonts as theme settings)
```

Local workflow: `shopify theme dev` for live preview, `shopify theme push` to deploy.
Theme code is git-tracked in this repo.

## Catalog Model

Reconcile the prototype's two differing product lists into one clean catalog —
**5 real Shopify products** across 3 collections:

| Collection | Products |
|---|---|
| Bait Boxes | The Compact Four (£48), The Modular Six (£64), The Bank Eight (£82) |
| Wafter Supports / Mounts | Edge Mount Pro (£28) |
| Full Systems | The Bank Kit (£119) |

Finish (Matte / Carbon / Steel) is an optional Shopify **variant** (price-differentiated)
or a plain label if not. Each bait box exposes an engraving line item property.

## Homepage Sections (1:1 with prototype)

- **ma-hero** — "Organized. Precise. Personalized." split-view, product photo, stats
  (3D-Printed / Engraved / ∞ Configurations), "Start Customizing" CTA scrolls to configurator.
- **ma-products** — product grid fed by a Shopify collection (replaces hardcoded array).
- **ma-configurator** — "Personalize": choose 1 of 3 bait boxes, type a name (free, ≤16 chars),
  live etched preview, "Add to Build" → real Shopify cart with engraving property.
- **ma-footer** — Shop / Company / newsletter columns; newsletter wired to Shopify customer
  signup.
- **nav** — MA logo, search, cart count (live from Shopify cart), Customize CTA.

## Brand System

Design tokens as CSS variables + exposed Shopify theme settings:
- Colors: cream `#faf9f5`, dark `#0A0A0B` / `#121212`, teal accent `#4FD1C5`, steel greys, green tones.
- Fonts: Sora (display), Manrope (body), JetBrains Mono (mono).
- Components: glass buttons (`btn-glass`), steel buttons (`btn-steel`), glass tags, eyebrow labels.
Applied globally so product/cart/collection pages inherit the dark aesthetic.

## Personalization Detail

The engraving input posts `properties[Engraving]` with the add-to-cart form. Value shows on
the cart line, the order confirmation, and the merchant order detail — telling the maker
exactly what to engrave. Client-side 16-char limit mirrors the prototype. No paid upcharge
(free engraving) in round one.

## Prerequisites (user-supplied, blocking execution)

- Shopify account + store (free trial or dev store).
- Shopify CLI + Node.js installed locally.
- Real product photos (bankside hero shot + product images).
- Final product names, prices, descriptions, stock levels.
- Business details for policy pages + payment provider setup.

## Open Items / Risks

- Finish-as-variant vs label: confirm during product entry.
- Real assets (photos) gate a true pixel match; placeholders used until provided.
- Dawn version pinning: lock the Dawn version we fork to avoid upstream drift.
