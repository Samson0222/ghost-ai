# Fix: Smooth Project Switching

## Problem Description

When the user clicks a project in the left sidebar to switch projects, three things happen in quick succession that produce a jarring experience:

1. The sidebar immediately slides away (hides).
2. The canvas area briefly shows a "Connecting…" message.
3. The sidebar reappears with the new project loaded.

The expected behaviour is that the sidebar stays visible and stationary throughout the switch, and the canvas area transitions seamlessly to the new project without intrusive loading text.

## Root Cause Analysis

### Cause 1 — Sidebar closes on every project click (desktop + mobile)

In `components/editor/project-sidebar.tsx`, `ProjectItem` attaches an `onClick` handler to the `<Link>`:

```tsx
<Link href={`/editor/${project.id}`} onClick={onOpen} ...>
```

`onOpen` is passed down as `onClose` from `ProjectSidebar`, which in turn is `() => setIsSidebarOpen(false)` in `WorkspaceShell`. Clicking any project link therefore fires `setIsSidebarOpen(false)` immediately — hiding the sidebar before the navigation even starts.

This callback exists to dismiss the mobile overlay (`bg-black/50 sm:hidden`) on small screens. On desktop there is no overlay, so there is no reason to close the sidebar. The fix should scope the callback to mobile only.

### Cause 2 — "Connecting…" flash when the Liveblocks room changes

`WorkspaceRoomProvider` in `components/editor/canvas-room-wrapper.tsx` passes `roomId` into `RoomProvider`. When the user navigates to a different project, `RoomProvider` receives a new `id`, triggers a Liveblocks room disconnect + reconnect, and suspends. `ClientSideSuspense` in `CanvasRoom` renders its fallback:

```tsx
fallback={
  <div className="flex h-full w-full items-center justify-center">
    <p className="text-sm text-copy-faint">Connecting…</p>
  </div>
}
```

This text flashes in the canvas area while the new room handshake completes, which typically takes under a second but is visually disruptive.

## Fix Plan

Two small, targeted changes — one per root cause.

### Fix 1 — Scope the sidebar-close to mobile only (`project-sidebar.tsx`)

In `ProjectItem`, replace the unconditional `onClick={onOpen}` with a handler that only calls `onOpen` when the viewport is below the `sm` breakpoint (640 px). On desktop the sidebar stays open during and after navigation.

```tsx
// Before
<Link href={`/editor/${project.id}`} onClick={onOpen} ...>

// After
<Link
  href={`/editor/${project.id}`}
  onClick={() => {
    if (window.matchMedia("(max-width: 639px)").matches) {
      onOpen?.();
    }
  }}
  ...
>
```

On mobile, the sidebar still closes when a project is clicked (so the black overlay dismisses). On desktop, `isSidebarOpen` remains `true` and the sidebar stays in place throughout the navigation.

### Fix 2 — Replace the "Connecting…" fallback with a silent dark background (`canvas-room-wrapper.tsx`)

The fallback shown while Liveblocks connects should be visually indistinguishable from the empty canvas — a plain dark background with no text. The user sees a momentary dark canvas instead of a loading message, which is far less intrusive.

```tsx
// Before
fallback={
  <div className="flex h-full w-full items-center justify-center">
    <p className="text-sm text-copy-faint">Connecting…</p>
  </div>
}

// After
fallback={<div className="h-full w-full bg-base" />}
```

The error boundary still shows a human-readable message when the connection genuinely fails (`CanvasErrorBoundary`), so recoverable transient delays are silent while hard failures remain visible.

## Files to Change

| File | Change |
|------|--------|
| `components/editor/project-sidebar.tsx` | Scope `onOpen` call to mobile inside `ProjectItem`'s `onClick` |
| `components/editor/canvas-room-wrapper.tsx` | Replace "Connecting…" suspense fallback with `<div className="h-full w-full bg-base" />` |

No changes to routing, Liveblocks config, `WorkspaceShell`, or canvas logic.

## Acceptance Criteria

- [ ] Clicking a project in the sidebar on desktop does not close or animate the sidebar.
- [ ] The sidebar remains fully visible and interactive while the new canvas connects.
- [ ] The canvas area shows a dark background (not "Connecting…" text) during the brief Liveblocks handshake.
- [ ] On mobile, clicking a project still dismisses the sidebar overlay as before.
- [ ] `npm run build` passes with no type errors.
