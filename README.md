# Holiday.exe

> A love letter, disguised as software.

---

This is not a demo. Not a portfolio piece. Not a starter template.

This is a Christmas gift I built for my girlfriend, Carolina. A real app. Engineered with care, shipped with intention, and designed to make one person smile on one morning.

## What It Is

**Holiday.exe** is a multi-phase interactive experience wrapped in terminal aesthetics and space-mission theming. It runs like a game but feels like a letter.

The journey:

- A boot sequence that feels like hacking into something important
- Biometric authentication (fingerprint scanner, passcode entry)
- A mission briefing: **"RESTORE CONNECTION"**
- A side-scrolling game where you guide Carolina through parallax star fields
- A cozy room scene where two characters reunite
- A memory-match mini-game floating in zero gravity
- An encrypted intel briefing that decrypts into a love letter
- A terminal Wordle game: three romantic words to fully unlock the connection

It runs natively on iOS via Capacitor. It works offline as a PWA. It has sound design, confetti, snowfall, and hand-tuned animations at 60fps.

## Why This Exists

Because building something for someone you love hits different.

Most of us spend our days shipping software for strangers. Features get specced, scoped, shipped, and forgotten. The feedback loop is metrics. The outcome is a dashboard.

But when you build for one person? When you know exactly who will open it, and you can picture their face while you code? The standards change. Every animation matters. Every sound effect is intentional. The deadline is real: Christmas morning.

This project reminded me why I started building things in the first place.

## Technical Notes

Stack: Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Framer Motion, Zustand

- Mobile-first, portrait-locked
- All assets preloaded before the experience starts
- Audio unlocks on first user interaction (browser policy compliance)
- Runs as native iOS app via Capacitor with custom splash screen
- Zero ESLint warnings, zero TypeScript errors, every build passes

## For You

If you've read this far, you might be the type of person who would build something like this.

So here's my invitation: fork it. Remix it. Build your own version for someone you care about.

Strip out Carolina's name and put in someone else's. Replace the otter sprites with whatever inside joke you share. Swap the encrypted letter for your own words. Keep the terminal boot sequence or ditch it entirely.

The code is here. The structure is here. The hard parts (iOS audio, PWA offline support, 60fps mobile animations) are solved.

What you write in the final letter? That's yours.

## A Note

Carolina, if you're reading this README instead of opening the app: close this tab and go to the real thing. The source code isn't the gift.

But also: hi. Merry Christmas.

---

Built with late nights, too much coffee, and the kind of focus that only appears when you're making something that actually matters.

**Dinesh**
