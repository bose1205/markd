# Markd — Personal Bookmarks App

## Stack
- **Next.js 14** App Router, TypeScript, Tailwind CSS
- **Firebase Auth** (Google OAuth only) + **Firestore**
- **lucide-react** for icons
- No other third-party UI libraries

## Project Structure
```
app/
  layout.tsx              ← Root layout with Geist font + ToastProvider
  page.tsx                ← Auth-aware redirect (/ → /home or /login)
  globals.css             ← All CSS variables (colours, type scale, animations)
  ToastProvider.tsx        ← Global toast context
  login/page.tsx          ← Google sign-in page
  home/page.tsx           ← Main bookmark feed with search, masonry grid, project filters
  profile/page.tsx        ← User profile, projects list, settings, sign out, delete account
  api/meta/route.ts       ← Server-side URL metadata fetcher
  projects/[id]/page.tsx  ← Project detail page with filtered bookmarks
components/
  BookmarkCard.tsx        ← Card with thumbnail, favicon, title, description, project badge, delete
  BookmarkModal.tsx       ← Add/edit bookmark modal with metadata auto-fetch + project selection
  MasonryGrid.tsx         ← CSS column-count masonry layout
  BottomNav.tsx           ← Floating pill nav bar (home, add, profile) + CreateMenu
  CreateMenu.tsx          ← Floating action menu for creating bookmarks or projects
  ProjectModal.tsx        ← Add/edit project modal
  ProjectDropdown.tsx     ← Multi-select dropdown for assigning bookmarks to projects
  SearchBar.tsx           ← Fixed top search with real-time filtering
  Toast.tsx               ← Stacking toast notifications
  LoadingSkeleton.tsx     ← Shimmer placeholder cards
  DeleteConfirm.tsx       ← Inline delete confirmation
lib/
  firebase.ts             ← Firebase app/auth/db initialisation
  auth.ts                 ← signInWithGoogle, signOutUser, onAuthChange
  bookmarks.ts            ← Firestore CRUD for bookmarks + projects
hooks/
  useAuth.ts              ← Auth state hook
  useBookmarks.ts         ← Real-time bookmark subscription hook
  useProjects.ts          ← Real-time project subscription hook
  useToast.ts             ← Toast queue state management
  useClipboard.ts         ← Global Cmd+V/Ctrl+V URL detection
types/
  bookmark.ts             ← Bookmark interface (includes projectIds)
  project.ts              ← Project interface
firestore.rules           ← Per-user security rules (bookmarks, profile, projects)
```

## Data Model
- **Bookmark**: id, url, title, description, thumbnail, favicon, projectIds (string[]), createdAt
- **Project**: id, name, description, createdAt
- Bookmarks can belong to multiple projects via the `projectIds` array
- Firestore paths: `/users/{uid}/bookmarks/`, `/users/{uid}/projects/`, `/users/{uid}/profile/`

## Design System

### Font
Geist (local woff files in app/fonts/). Applied globally via layout.tsx.
No other fonts.

### Type Scale (CSS variables in globals.css)
Desktop: caption 12px, body-sm 14px, body-lg 16px, h3 20px, h2 24px, h1 28px
Mobile (≤640px): caption 10px, body-sm 12px, body-lg 14px, h3 18px, h2 20px, h1 24px

### Colour Palette
Neutral only. All colours defined as CSS variables in globals.css.
`--color-destructive` (#DC2626) is the only non-neutral colour.

### Spacing
Strict 4px grid. All spacing values must be multiples of 4px.
Card internal padding: 16px always.

### Border Radius
- Cards & modals: 24px
- Buttons & inputs: 16px
- Pills & nav bar: 999px
- Never use values that aren't multiples of 4 (except 999px for pills)

### Elevation
- Floating elements: `box-shadow: 0 4px 24px rgba(0,0,0,0.08)` (class: shadow-float)
- Cards on hover: `box-shadow: 0 2px 12px rgba(0,0,0,0.06)` (class: shadow-card-hover)
- Default: no shadow

## Conventions
- All Firestore operations go through `lib/bookmarks.ts` — never call Firestore directly from components
- All auth operations go through `lib/auth.ts`
- CSS variables for colours and type scale — no hardcoded hex values outside globals.css
- Inline styles using CSS variables (not Tailwind utility classes for design tokens)
- Components use `"use client"` directive when they need interactivity

## What NOT to Do
- Do not add dark mode
- Do not use any font other than Geist
- Do not use hardcoded hex colour values outside globals.css
- Do not add third-party UI libraries
- Do not use spacing values that aren't multiples of 4px
- Do not call Firestore directly from components — use lib/bookmarks.ts
- Do not use `<Image>` from next/image for external URLs (use `<img>` with eslint-disable)
