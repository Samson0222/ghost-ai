# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 02: Editor Chrome — complete

## Current Goal

- Authentication and route protection (Clerk).

## Completed

- Cleaned up Next.js boilerplate (stripped globals.css, removed SVGs, replaced page.tsx with minimal stub).
- **Design system** — shadcn/ui initialized, all 7 UI primitive components added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react installed, `lib/utils.ts` with `cn()` in place, `globals.css` rewritten as dark-only with full design system token set.
- **Editor chrome** — `EditorNavbar` (fixed top bar, PanelLeftOpen/Close toggle), `ProjectSidebar` (fixed floating overlay, slide-in from left, My Projects / Shared tabs, New Project button), `EditorDialog` (reusable dialog pattern with title/description/footer slots). Components wired in `app/page.tsx`.

## In Progress

- None yet.

## Next Up

- Authentication and route protection (Clerk).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Dark only — no light mode. All color tokens defined in `globals.css` as CSS custom properties, mapped to Tailwind via `@theme inline`. shadcn variables point to design system tokens so components inherit the dark theme automatically.
- shadcn components live in `components/ui/` and are not modified after generation.
- `--radius` base is `0.75rem`; `@theme inline` derives `radius-xl/2xl/3xl/4xl` from it to match the border-radius scale in ui-context.md.

## Session Notes

- Next.js 16.2.6 + Tailwind v4 (`@tailwindcss/postcss`, `@import "tailwindcss"` in globals.css — no tailwind.config.js).
- shadcn 4.7.0 supports Tailwind v4 natively; uses CSS variable tokens in globals.css.
- Design system Tailwind utilities: `bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `text-copy-primary`, `text-copy-secondary`, `text-copy-muted`, `text-copy-faint`, `bg-brand`, `text-brand`, `bg-ai`, `text-ai-text`, `bg-success`/`warning`/`error`, `border-border-subtle`.
