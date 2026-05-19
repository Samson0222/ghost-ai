# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 09: Share Dialog — complete

## Current Goal

- Continue with next feature spec.

## Completed

- Cleaned up Next.js boilerplate (stripped globals.css, removed SVGs, replaced page.tsx with minimal stub).
- **Design system** — shadcn/ui initialized, all 7 UI primitive components added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react installed, `lib/utils.ts` with `cn()` in place, `globals.css` rewritten as dark-only with full design system token set.
- **Editor chrome** — `EditorNavbar` (fixed top bar, PanelLeftOpen/Close toggle), `ProjectSidebar` (fixed floating overlay, slide-in from left, My Projects / Shared tabs, New Project button), `EditorDialog` (reusable dialog pattern with title/description/footer slots). Components wired in `app/page.tsx`.
- **Authentication** — Clerk wired in: `ClerkProvider` in root layout with `dark` theme from `@clerk/ui/themes` and CSS variable overrides; `proxy.ts` at project root using `clerkMiddleware` and `createRouteMatcher` to protect all non-auth routes; sign-in and sign-up pages at `/sign-in` and `/sign-up` with two-panel layout (logo + feature list left, Clerk form right; form-only on small screens); `/` redirects to `/editor`; `UserButton` in editor navbar right section. Editor moved to `app/(editor)/editor/page.tsx`; auth pages isolated in `app/(auth)/`.
- **Project dialogs (Feature 04)** — editor home screen with project grid, create/rename/delete dialogs, sidebar project actions with mobile backdrop. Mock data only.
- **Prisma (Feature 05)** — `prisma/models/project.prisma` with `Project` and `ProjectCollaborator` models; `lib/prisma.ts` cached singleton branching on `prisma+postgres://` (Accelerate) vs direct `@prisma/adapter-pg`; migration `20260519061317_init` applied; client generated to `app/generated/prisma`.
- **Project APIs (Feature 06)** — `app/api/projects/route.ts` (GET list, POST create); `app/api/projects/[projectId]/route.ts` (PATCH rename, DELETE). Clerk `auth()` enforces 401 for unauthenticated requests; owner check enforces 403 for non-owner mutations. POST defaults missing name to `'Untitled Project'`. `npm run build` passes.
- **Wire Editor Home (Feature 07)** — `lib/projects.ts` with `getMyProjects()`/`getSharedProjects()` server helpers and `ProjectRecord` interface; `EditorLayout` is now a server component that fetches both lists and passes to `EditorShell`; `EditorShell` accepts project props and uses `useProjectActions` (replacing mock `useProjectDialogs`); `hooks/use-project-actions.ts` calls real API endpoints — POST creates and navigates to `/editor/[id]`, PATCH renames and calls `router.refresh()`, DELETE redirects to `/editor` if deleting active workspace else refreshes; `editor/page.tsx` is a server component using `NewProjectButton` (client component) for the create trigger; `ProjectSidebar` uses `ProjectRecord` type, removed mock data; dialogs updated to use `ProjectRecord`; create dialog shows Room ID preview (slugified name + per-session suffix). `npm run build` passes.
- **Editor Workspace Shell (Feature 08)** — `lib/project-access.ts` with `getCurrentUser()` (userId + primary email via Clerk `currentUser()`) and `getProjectWithAccess(projectId)` (checks owner or collaborator by email); `components/editor/access-denied.tsx` with centered layout, lock icon, message, and link back to `/editor`; `app/(workspace)/editor/[roomId]/page.tsx` server component — unauthenticated users redirect to `/sign-in`, missing or unauthorized projects render `AccessDenied`, valid projects render `WorkspaceShell`; `components/editor/workspace-shell.tsx` client component with full-viewport layout — fixed navbar showing project name + share button + AI sidebar toggle + UserButton, existing `ProjectSidebar` with `activeProjectId` highlight, canvas placeholder, toggleable right AI sidebar placeholder; `ProjectSidebar` updated with optional `activeProjectId` prop (active item styled with `bg-subtle` + `text-copy-primary font-medium`). Workspace lives in `app/(workspace)/` route group (separate from `app/(editor)/`) so it uses root layout only, not `EditorShell`. `npm run build` passes.
- **Share Dialog (Feature 09)** — `getProjectWithAccess` extended to return `ProjectWithRole` (`isOwner: boolean`); `app/api/projects/[projectId]/collaborators/route.ts` (GET list enriched via Clerk `getUserList`, POST invite with owner-only guard, email validation, duplicate check); `app/api/projects/[projectId]/collaborators/[collaboratorId]/route.ts` (DELETE, owner-only); `hooks/use-share-dialog.ts` manages open/close, load, invite, remove, copy-link with optimistic remove; `components/editor/share-dialog.tsx` — project link section with Copy/Copied! toggle, scrollable collaborator list with Avatar+fallback initials, remove button (owner only), invite form with inline error (owner only); `WorkspaceShell` updated to accept `isOwner`, call `useShareDialog`, wire Share button and render `ShareDialog`; workspace page passes `isOwner` destructured from `ProjectWithRole`. shadcn Avatar component added. `npm run build` passes.

## In Progress

- None.

## Next Up

- Continue with next feature spec after Feature 09.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Dark only — no light mode. All color tokens defined in `globals.css` as CSS custom properties, mapped to Tailwind via `@theme inline`. shadcn variables point to design system tokens so components inherit the dark theme automatically.
- shadcn components live in `components/ui/` and are not modified after generation.
- `--radius` base is `0.75rem`; `@theme inline` derives `radius-xl/2xl/3xl/4xl` from it to match the border-radius scale in ui-context.md.
- Route groups: `app/(auth)/` for sign-in and sign-up pages (no EditorShell); `app/(editor)/` for the editor workspace (EditorShell via group layout). Root layout provides only ClerkProvider + html/body; no page-level chrome.
- `proxy.ts` (Next.js 16 name for middleware) defines public routes from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars; all other routes are protected by `auth.protect()`.

## Session Notes

- Next.js 16.2.6 + Tailwind v4 (`@tailwindcss/postcss`, `@import "tailwindcss"` in globals.css — no tailwind.config.js).
- shadcn 4.7.0 supports Tailwind v4 natively; uses CSS variable tokens in globals.css.
- Design system Tailwind utilities: `bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `text-copy-primary`, `text-copy-secondary`, `text-copy-muted`, `text-copy-faint`, `bg-brand`, `text-brand`, `bg-ai`, `text-ai-text`, `bg-success`/`warning`/`error`, `border-border-subtle`.
- Clerk v7 (`@clerk/nextjs@7.3.5`) — `clerkMiddleware` exported from `@clerk/nextjs/server`; `ClerkProvider`, `SignIn`, `SignUp`, `UserButton` from `@clerk/nextjs`. `dark` theme from `@clerk/ui/themes`.
- In Next.js 16, `middleware.ts` is renamed to `proxy.ts` — same API, new filename convention.
- Prisma 7.8.0 — `prisma.config.ts` drives schema dir (`prisma/`), migrations path, and datasource URL (overrides schema file). Schema dir is recursively scanned for `.prisma` files. Client output at `app/generated/prisma/`; import via `@/app/generated/prisma/client`. `PrismaClient` in v7 requires either `adapter` or `accelerateUrl` (mutually exclusive). Accelerate URLs start with `prisma+postgres://`; direct pg uses `new PrismaPg({ connectionString })`.
