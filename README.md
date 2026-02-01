# MeetAI

**Build and Deploy a SaaS AI Agent Platform | Next.js 15, React, Better Auth, Polar**

---

## 🚀 Project Overview

MeetAI is a platform to build and deploy SaaS AI agents. This repository is scaffolded for a modern Next.js + TypeScript stack and is intended to evolve during development. The README will be updated continuously to reflect progress, decisions, and setup notes.

## 📋 Table of Contents

- [Quickstart](#-quickstart)
- [Features](#-features)
- [Project Status & Development Log](#-project-status--development-log)
- [Project Structure](#-project-structure)
- [Contributing & Updating this README](#-contributing--updating-this-readme)
- [License](#-license)

---

## ⚡ Quickstart

Prerequisites:
- Node.js (recommended LTS)
- npm

Install and run locally:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

Linting and type checks (if configured):

```bash
npm run lint
```

---

## ✨ Features

- Next.js 15 + React
- TypeScript
- Tailwind CSS (v4+)
- shadcn/ui (component library) — Base UI option
- Helpful utilities: `cn` helper, `clsx`, `tailwind-merge`
- Designed for integration with modern auth (Better Auth) and Polar for user management

---

## 🔨 Project Status & Development Log

This section is a running log of work done and short-term TODOs. I will update it as development progresses.

### Unreleased
- [ ] Fresh project scaffold: Next.js + TypeScript + Tailwind + shadcn (Base UI)
- [ ] Add example components and UI demo pages
- [ ] Add auth (Better Auth) + Polar integration
- [ ] End-to-end tests and CI

### Changelog
- **2026-02-01** — README created and updated. Tailwind config added and `globals.css` updated for Tailwind v4. Installed `clsx`, `tailwind-merge`, and `tailwindcss-animate`. Ran `npx shadcn@latest init` (project initialized). Sample component add step pending.

> Want an entry added? Tell me what changed and I will append a concise log entry and update the status.

---

## 📁 Project Structure (example)

```
/ (repo root)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  └─ lib/
│     └─ utils.ts
├─ tailwind.config.cjs
├─ package.json
└─ README.md
```

---

## 🤝 Contributing & Updating this README

- If you want the README updated as features are added, mention the change and I (the assistant) will update the Development Log and relevant sections.
- Keep entries short and factual — date, short description, and status.

---

## ⚖️ License

This project does not yet have a license. Add a `LICENSE` file when you decide on one.

---

If you'd like, I can now:
- scaffold a fresh Next.js + TypeScript project here and complete the shadcn (Base UI) setup, or
- finish adding a sample component (e.g., Button) and a demo page.

Tell me which you prefer and I will continue. ✨