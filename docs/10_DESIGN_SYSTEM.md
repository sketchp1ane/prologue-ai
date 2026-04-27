# 10 — Design System

## Current Status

The v0 homepage has been imported and visually restored. The current public homepage is now the visual baseline for Prologue / 第一页.

Use the implementation in `app/page.tsx`, `app/globals.css`, `components/landing/*`, and `components/ui/button.tsx` as the source of truth for future product UI. Do not redesign from scratch.

## 1. Overall Style Direction

Prologue should feel like a calm, premium AI workspace:

- Tailwind / shadcn style foundations.
- Notion-like editorial clarity.
- Apple-like minimalism and restraint.
- Monochrome brand system, not a colorful SaaS theme.
- White and soft gray surfaces.
- Charcoal typography.
- Subtle borders and soft shadows.
- Generous whitespace.
- Functional product UI first, decorative marketing second.

Future app pages should feel like they belong to the homepage: quiet, structured, confident, and focused on the user's job-search workflow.

## 2. Color Palette

Use the neutral token system in `app/globals.css`.

Core tokens:

```txt
--background: oklch(1 0 0)
--foreground: oklch(0.145 0 0)
--card: oklch(1 0 0)
--card-foreground: oklch(0.145 0 0)
--primary: oklch(0.205 0 0)
--primary-foreground: oklch(0.985 0 0)
--secondary: oklch(0.97 0 0)
--secondary-foreground: oklch(0.205 0 0)
--muted: oklch(0.97 0 0)
--muted-foreground: oklch(0.556 0 0)
--accent: oklch(0.97 0 0)
--accent-foreground: oklch(0.205 0 0)
--border: oklch(0.922 0 0)
--input: oklch(0.922 0 0)
--ring: oklch(0.708 0 0)
```

Color roles:

- `background`: page background.
- `foreground`: primary text.
- `muted-foreground`: secondary copy, nav links, metadata, captions.
- `primary`: black/charcoal brand actions and active states.
- `primary/10` and `primary/20`: subtle neutral badges, icon tiles, hover borders.
- `secondary` and `secondary/30`: soft gray bands, product mockup sidebars, workflow sections.
- `border`: all quiet dividers, card borders, input borders, and outline buttons.

Small semantic status dots may use color when they communicate state, as in the homepage product mockup:

- macOS-style window dots: red, yellow, green.
- Job card status dots: blue, orange, neutral, indigo, rose.

These colors must remain tiny and semantic. They are not brand colors.

## 3. Typography Hierarchy

Use Geist Sans via `app/layout.tsx` and the global `--font-sans` token.

Homepage hierarchy:

- Brand wordmark: `text-lg font-semibold tracking-tight`.
- Nav links: `text-sm text-muted-foreground`, hover to `text-foreground`.
- Hero headline: `text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight`.
- Hero supporting copy: `text-lg leading-relaxed text-muted-foreground`.
- Section headings: `text-2xl sm:text-3xl font-semibold tracking-tight`.
- Section body copy: `text-muted-foreground`.
- Card titles: `text-lg font-medium`.
- Product mockup labels: `text-xs` and `text-[10px]` for dense interface metadata.

Rules:

- Keep headings crisp and heavy, but not decorative.
- Use muted gray for explanatory copy.
- Avoid oversized type inside cards, sidebars, dashboards, and product surfaces.
- Use `tracking-tight` only where the homepage already does: brand text and large headings.

## 4. Spacing And Layout Rules

Homepage layout patterns:

- Page content is constrained with `max-w-7xl mx-auto px-6`.
- Header height is `h-16`.
- Hero uses generous vertical spacing: `pt-32 pb-20 lg:pt-40 lg:pb-32`.
- Hero grid uses two columns on large screens: `lg:grid-cols-2`, `gap-12 lg:gap-16`.
- Sections use large vertical padding: `py-20 lg:py-28` or `py-16 lg:py-24`.
- Internal card spacing uses `p-6 lg:p-8` for feature cards and tighter spacing for product mockup UI.
- Repeated UI groups use small consistent gaps: `gap-2`, `gap-3`, `gap-6`, and `space-y-2`.

Future app pages:

- Prefer stable, scannable layouts over ornamental hero sections.
- Use constrained content widths and consistent gutters.
- Use full-width bands or unframed layouts for page sections.
- Use cards for repeated items, modals, and genuinely framed tools; do not nest cards inside cards.
- Keep dashboard density practical and calm.

## 5. Card Style

Cards should be white or token-backed neutral surfaces:

- Surface: `bg-card`.
- Border: `border border-border`.
- Radius: `rounded-lg`, `rounded-xl`, or `rounded-2xl` depending on scale.
- Shadow: `shadow-sm` for small product cards, `shadow-xl` for floating panels, `shadow-2xl shadow-primary/5` for the main homepage mockup.
- Padding: from `p-2.5` for tiny mockup cards to `p-6 lg:p-8` for feature cards.

Feature cards:

- `rounded-2xl border border-border bg-card p-6 lg:p-8`.
- Hover can use `hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20`.
- Icon tile uses `bg-primary/10` with `text-primary`.

Product cards:

- Compact, bordered, shadowed, and information-dense.
- Use `truncate` for constrained mockup text.
- Use dashed borders for empty placeholders.

## 6. Button Style

Primary button:

- Black/charcoal fill via `bg-primary`.
- Text uses `text-primary-foreground`.
- Hover uses `hover:bg-primary/90`.
- Homepage CTAs use pill radius: `rounded-full`.
- Hero primary CTA size: `h-12 px-6 text-base`.
- Header primary CTA size: `size="sm"`, `rounded-full px-4`.

Secondary outline button:

- Neutral outline, not black-heavy.
- Surface stays `bg-background`.
- Border uses `border-border`.
- Text uses normal foreground.
- Homepage demo CTA: `h-12 rounded-full border-border px-6 text-base`.
- Keep the icon small and familiar: lucide `Play` at `h-4 w-4`.

Product mockup mini action:

- Primary mini action uses `bg-primary text-primary-foreground`.
- Secondary mini action is text-only muted, with hover to foreground.

## 7. Badge Style

Homepage badge:

- Pill shape: `rounded-full`.
- Compact spacing: `px-3 py-1.5`.
- Soft neutral fill: `bg-primary/10`.
- Subtle neutral border: `border border-primary/20`.
- Icon and text use `text-primary`.
- Text size: `text-xs font-medium`.

Badges and chips should be quiet and grayscale. Use colored badges only when they communicate product state, not decoration.

## 8. Product Mockup Style

The product mockup is the visual anchor for future product screens.

Main frame:

- `rounded-2xl`.
- `border border-border`.
- `bg-card`.
- `shadow-2xl shadow-primary/5`.
- Window header uses `bg-secondary/30`, `border-b border-border`, and macOS-style status dots.

Sidebar:

- Width: `w-44`.
- Background: `bg-secondary/20`.
- Active item: `bg-primary text-primary-foreground`.
- Inactive items: `text-muted-foreground hover:bg-secondary`.
- Icons: lucide, `h-3.5 w-3.5`.

Board:

- Dense but calm columns.
- Column headers use `text-xs font-medium`.
- Card body uses `text-[10px] text-muted-foreground`.
- Empty state in the mockup uses dashed border and muted text.

Floating analysis panels:

- `bg-card border border-border rounded-xl shadow-xl`.
- Diagnosis score ring uses neutral `text-primary` over `text-secondary`.
- Match chips use `bg-primary/10 text-primary`.
- Progress bar uses `bg-secondary` track and `bg-primary` fill.

Bullet rewrite panel:

- Original text is muted.
- AI label uses `text-primary`.
- Generated text uses foreground.
- Apply action uses compact `bg-primary text-primary-foreground`.

## 9. Border, Radius, And Shadow Rules

Border rules:

- Default border token is `border-border`.
- Use `border-border/50` for translucent global chrome like the navbar.
- Use `border-primary/20` only for subtle brand-neutral hover or badge borders.
- Use dashed borders only for empty placeholders.

Radius rules:

- Global radius token: `--radius: 0.625rem`.
- Buttons in marketing and top-level CTAs use `rounded-full`.
- Product cards use `rounded-lg`.
- Floating panels use `rounded-xl`.
- Main mockup and feature cards use `rounded-2xl`.

Shadow rules:

- Use shadows sparingly.
- Small product cards: `shadow-sm`.
- Floating utility cards: `shadow-xl`.
- Main product frame: `shadow-2xl shadow-primary/5`.
- Feature card hover: `hover:shadow-lg hover:shadow-primary/5`.
- Do not use colored glow shadows.

## 10. Empty State Style For Future App Pages

Empty states should feel useful, not decorative.

Use:

- White or page-background surface.
- `border border-dashed border-border` for empty drop zones or blank columns.
- Muted gray copy with a concise action.
- One primary CTA if the next action is obvious.
- Optional small lucide icon in `text-muted-foreground` or `text-primary`.

Avoid:

- Large playful illustrations.
- Mascots.
- Gradient artwork.
- Marketing-style empty states inside authenticated dashboards.
- Overly cheerful copy for private job-search data.

Example direction:

```txt
No applications yet
Paste a job description to create your first tracked application.
[Create application]
```

## 11. AI Result Card Style

Diagnosis, rewrite, outreach, interview review, and weekly insight UI should extend the floating analysis card style.

Use:

- `bg-card border border-border rounded-xl shadow-sm` or `shadow-xl` depending on prominence.
- Compact section labels in `text-xs font-medium text-muted-foreground`.
- Primary result values in `text-foreground`.
- AI-highlight labels in `text-primary`.
- Chips in `bg-primary/10 text-primary`.
- Progress bars with `bg-secondary` track and `bg-primary` fill.
- Clear actions with black primary buttons and muted secondary text buttons.

For diagnosis reports:

- Score ring or score block should be neutral black/gray.
- Strengths can use neutral chips.
- Gaps and risks should use severity sparingly; do not turn the whole report into a colorful dashboard.
- Recommended actions should be scan-friendly list rows with subtle borders.

For bullet rewriting:

- Show original text muted.
- Show generated text in foreground.
- Use small labels for strategy and rationale.
- Apply/copy actions should be compact and predictable.
- Never use color to imply fabricated confidence.

## 12. What Not To Do

Do not switch to a blue brand theme.

- `primary` must remain near-black.
- Do not map primary, ring, badge, score ring, progress bars, active sidebar states, or CTAs to blue.
- Blue may appear only as tiny semantic status dots when inherited from the product mockup pattern.

Do not add noisy gradients.

- The homepage uses only a subtle `from-secondary/50 via-background to-background` hero gradient.
- Do not add gradient blobs, bokeh, glowing orbs, neon washes, or decorative background effects.

Do not use playful illustrations.

- The brand should feel focused, editorial, and premium.
- Avoid mascots, cartoon scenes, confetti, sticker-style graphics, and whimsical empty states.

Do not overdecorate dashboard UI.

- Dashboards should be dense enough for repeated work, but calm.
- Avoid oversized stat cards, excessive shadows, nested cards, large marketing heroes, and decorative icon grids.
- Use color sparingly and only for state, severity, or tiny status markers.

Do not make future pages visually louder than the homepage.

- Keep the product experience quiet and task-focused.
- Let private resume, job description, and application data remain the center of attention.
