# CLAUDE.md — Engineering Contract

**Project:** Christmas Gift 2025 ("North Pole Connection")
**Stack:** Next.js 14+ (App Router), TypeScript 5+ (strict), Tailwind CSS 3+, Framer Motion, Zustand
**Domain:** christmas.dinn.dev (Private/Local)

---

## 1. Non-Negotiable Rules

### 1.1 TypeScript

- `strict: true` is immutable — no silencing errors via config
- `any` is banned — use `unknown` if type genuinely unknown
- All functions: explicit return types and parameter types
- Props interfaces: exported and named `{ComponentName}Props`
- `as` assertions require inline comment justification — never use `as any`

### 1.2 Code Cleanliness

- **No console.log** — ESLint will fail (except in explicit debug builds)
- **No inline styles** — Tailwind or Framer Motion `style` prop only
- **No commented-out code** — delete it, git history exists
- **No magic numbers** — use Tailwind scale, named constants, or config variables

### 1.3 Mobile-First UX (Project Specific)

- **Touch Targets:** All interactive elements must be min 44x44px
- **No Scroll Glitches:** `overscroll-behavior-y: none` on game containers
- **Orientation:** Lock to Portrait or handle Landscape gracefully with a "Rotate Phone" prompt
- **Audio:** Audio must be muted by default until user interaction (browser policy)

### 1.4 Assets & Performance

- **Asset Loading:** All assets (sprites, sounds) must be preloaded before the experience starts
- **Image Optimization:** Use `next/image` for static UI, `img` tag or Canvas for game sprites
- **Animation Performance:** Animate `transform` and `opacity` only. Avoid animating layout properties (`width`, `height`, `top`)
- **Bundle limits:** Keep initial load lightweight, lazy load Phase 4 & 5 assets

### 1.5 AI Attribution (Strictly Forbidden)

- Never mention "Claude", "AI", "assistant", "generated", "Anthropic" in commits, PRs, or code
- Write commit messages as human developer — no AI attribution comments
- Pre-commit hooks enforce this

---

## 2. Git Workflow

### 2.1 Branch Flow

```bash
git checkout main && git pull origin main    # Always start fresh
# Make changes, then create branch BEFORE committing:
git checkout -b feature/descriptive-name
```

### 2.2 Commit Format (Conventional Commits)

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
**Scopes:** `auth`, `game`, `room`, `reveal`, `ui`, `assets`, `audio`, `config`

```bash
git commit -m "feat(game): implement parallax scrolling for night sky"
```

### 2.3 Branch Naming

| Prefix      | Purpose                 |
| ----------- | ----------------------- |
| `feature/`  | New functionality       |
| `fix/`      | Bug fixes               |
| `assets/`   | Asset updates (sprites) |
| `refactor/` | Code refactoring        |

Rules: lowercase, hyphens, descriptive (not `feature/update`)

### 2.4 Branch Protection

- PR required, 1 reviewer (Self-review acceptable if solo), squash merge only
- CI must pass (lint, type-check, build)
- Never commit/force-push to main

---

## 3. Code Quality

### 3.1 Automated Checks

**Pre-commit:** ESLint, Prettier, TypeScript (staged files)
**CI:** ESLint (zero warnings), type-check, build

### 3.2 Rules

- Zero ESLint warnings in CI — no `eslint-disable` without justification
- Prettier config is immutable — run `npm run format` before commit
- No `@ts-ignore` without inline justification
- Build must pass locally before push

---

## 4. Component Standards

### 4.1 Structure

```typescript
import { motion } from 'framer-motion';

export interface FingerprintScannerProps {
  onScanComplete: () => void;
  isScanning: boolean;
}

export function FingerprintScanner({ onScanComplete, isScanning }: FingerprintScannerProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex h-24 w-24 items-center justify-center"
    >
       {/* Component Logic */}
    </motion.div>
  );
}
```

### 4.2 Rules

- **Framer Motion:** Use for all complex entrances/exits
- **Zustand:** Use for global state (e.g., `useGameStore`)
- **Composition:** Keep components small. Game logic belongs in hooks (`useGameLoop`), not JSX
- Colocate related files: `features/game/PlayerSprite.tsx`

---

## 5. Styling

- **Tailwind only** — no CSS modules or styled-components
- **Design Tokens:** Use `tailwind.config.ts` for project colors (`terminal-green`, `romance-gold`)
- **Z-Index Management:** Use a strict z-index scale (defined in tailwind config) to avoid layering issues
- **Class Order:** layout → box model → typography → visual → misc
- Use `prettier-plugin-tailwindcss` for automatic sorting

---

## 6. Naming Conventions

| Type             | Convention       | Example              |
| ---------------- | ---------------- | -------------------- |
| Components       | PascalCase       | `OtterSprite.tsx`    |
| Utilities        | camelCase        | `detectCollision.ts` |
| Stores (Zustand) | camelCase (use-) | `useGameStore.ts`    |
| Constants        | UPPER_SNAKE      | `MAX_LIVES`          |
| Assets           | snake_case       | `carolina_run.png`   |
| Props interfaces | `{Name}Props`    | `OtterSpriteProps`   |

---

## 7. Game & Animation Logic

### 7.1 State Management (Zustand)

```typescript
// store.ts
interface GameState {
  score: number;
  status: "idle" | "playing" | "won";
  incrementScore: () => void;
}
```

- Logic resides in stores or hooks, not UI components
- Avoid prop drilling deeper than 2 levels

### 7.2 Game Loop

- Use `requestAnimationFrame` for game loops (via `useFrame` or similar hook)
- Delta time (`dt`) must be used for movement to ensure consistency across refresh rates
- Collision detection logic must be decoupled from rendering

---

## 8. Directory Structure

```
app/           # Next.js App Router (pages: /, /game, /room, /reveal)
components/    # React components
  ui/          # Generic UI (Button, Modal)
  features/    # Domain specific (Game, Auth, Room)
lib/           # Utilities, stores, constants
public/        # Static assets (Strictly organized)
  assets/      # Sprites, backgrounds
  sounds/      # MP3/WAV files
```

- Use absolute imports: `@/components/features/game`
- Components: UI & Interaction only
- Utilities: Pure functions (collision detection, data parsing)

---

## 9. Error Handling

- **Graceful Degradation:** If WebGL/Canvas fails, show a "Lite Version" or fallback message
- **Asset Failures:** If an image fails to load, do not crash — show a placeholder or skip
- **User-facing messages:** Themed errors (e.g., "Signal Lost" instead of "404 Not Found")

---

## 10. Enforcement

- CI failures block merge — no override
- Code must be reviewed (even self-reviewed) for "Pixel Perfection"
- Verify animations are smooth (60fps) on mobile device simulation

---

**END OF DOCUMENT**

This is the engineering contract for the Christmas Gift Project. When in doubt, prioritize smooth animation and emotional impact.
