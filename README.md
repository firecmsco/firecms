<p align="center">
  <a href="https://rebase.pro">
    <img src="https://rebase.pro/img/logo_small.png" width="240px" alt="Rebase logo" />
  </a>
</p>

<h1 align="center">Rebase</h1>
<h3 align="center">The Ultimate Headless CMS & Admin Panel Framework for React Developers</h3>
<p align="center">
  Build powerful, radically extensible back-office apps in minutes.<br/>
  Own your data, own your code. Perfect for Firebase & PostgreSQL.
</p>

<p align="center">
  <a href="https://demo.rebase.pro">Live Demo</a> •
  <a href="https://rebase.pro/docs">Documentation</a> •
  <a href="https://rebase.pro/features">Features</a> •
  <a href="https://github.com/rebaseco/rebase">GitHub</a> •
  <a href="https://discord.gg/fxy7xsQm3m">Discord</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@rebasepro/core"><img src="https://img.shields.io/npm/v/@rebasepro/core.svg?style=flat-square&color=orange" alt="NPM Version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-purple.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://www.npmjs.com/package/@rebasepro/core"><img src="https://img.shields.io/npm/dw/@rebasepro/core?style=flat-square&color=blue" alt="NPM Downloads" /></a>
  <a href="https://discord.gg/fxy7xsQm3m"><img src="https://img.shields.io/discord/1013768502458470442?style=flat-square&logo=discord&logoColor=white&label=Discord" alt="Discord" /></a>
</p>

<br/>

<p align="center">
  <img src="https://rebase.pro/img/demo_products.png" width="800px" alt="Rebase Dashboard" />
</p>

---

## What is Rebase?

Rebase is a **developer-first**, open-source headless CMS and admin panel framework built with **React** and **TypeScript**. 
It's designed exclusively for developers who demand complete control and unlimited extensibility over their internal tools. By abstracting the heavy lifting of UI state, forms, routing, and database synchronization, it allows you to generate robust CRUD panels in minutes—while giving you the freedom to inject any custom React component you need.

### ✨ Key Highlights

- 🔓 **No Vendor Lock-in** — Self-host anywhere. You are entirely in control of your infrastructure, your code, and your database.
- ⚡ **Batteries-Included Docker Deployment** — Spin up a production-ready application locally via a single `docker compose up`.
- 🧩 **Radical Extensibility** — Not constrained to pre-built widgets. If you can build it in React, you can build it in Rebase.
- 🔥 **Native Database Adapters** — Real-time synchronization with Firebase/Firestore, PostgreSQL, and MongoDB right out of the box.
- 🎨 **Component Library** — Uses an incredibly fast, premium design system built on **Tailwind CSS (v4)** and Radix UI.
- 🤖 **AI-powered Automations** — Leverage DataTalk for natural language queries and AI to effortlessly infer and generate schemas from existing data.

---

## Quick Start

Scaffold a complete, self-hosted Rebase application connected to your database in seconds.

Our template relies on Docker Compose to orchestrate both your Rebase instance and a PostgreSQL database seamlessly across your environments.

```bash
npx @rebasepro/create my-rebase-app
```

Then, start the entire backend and frontend environment locally:
```bash
cd my-rebase-app
docker compose up
```

You're done! Your extremely scalable CMS is now alive. 

---

## Developer Features

### 🏓 Spreadsheet-Style Collection View

An incredibly fast, windowed spreadsheet view with inline editing, real-time updates, filtering, sorting, and text search. Switch flawlessly between multiple view modes: **spreadsheet table**, **card grid**, and **Kanban board**.

### 🧩 Custom Views & React Extensibility

Because Rebase is just a React framework, you can build entirely custom views (dashboards, previews, native charts) and drop them directly into the main navigation or as entity-level tabs. Utilize built-in hooks like `useSideEntityController`, `useSnackbarController`, and `useAuthController` to interact fluently with Rebase's internal state mechanism.

### 🎨 Visual Schema Editor & Data Inference

Design your data models visually with **20+ field types** and advanced validation rules using pure TypeScript. Even better, connect to an existing legacy database and let Rebase **automatically infer your schema**—going from zero to a strictly typed, full-featured admin panel within minutes.

### ✍️ Notion-Style Rich Text Editor

A beautiful block-based editor natively supporting slash commands, drag-and-drop blocks, keyboard shortcuts, and full AI-powered text completion. Built on TipTap v3.

### 📥📤 Deep File & Data Management

Import data from **CSV, JSON, and Excel** with an intuitive field mapper. Scale seamlessly with full Firebase Storage hooks for image resizing, video optimization, and file mapping components built-in to the interface.

### 👮 Roles, Permissions & User Management

Deploy granular, role-based access control strategies for collections, fields, and individual actions directly from your codebase logic.

---

## Core Technologies

Everything is built entirely upon standard modern web conventions:

| Technology | Version |
|---|---|
| TypeScript | 5.x |
| React | 18+ |
| Tailwind CSS | v4 |
| WebSockets | Real-time |
| Database | Firebase, Postgres, MongoDB |
| UI Primitives | Radix UI |
| Editor | TipTap v3 |

---

## Standalone UI Library (`@rebasepro/ui`)

Rebase exposes its premium design engine as an independent library. Fully typed, accessible, and customizable via Tailwind CSS. Use it instantly in any of your arbitrary React projects:

```bash
npm install @rebasepro/ui
```

---

## Demo

Explore a live interactive sandbox containing all core features — you can modify data freely since instances are routinely restored:

**👉 [demo.rebase.pro](https://demo.rebase.pro)**

---

## Monorepo Architecture

Rebase is structured as a modular monorepo, allowing you to consume only the layers you strictly need in your projects:

| Package | Description |
|---|---|
| `@rebasepro/core` | Core CMS framework, types, hooks, and components |
| `@rebasepro/ui` | Standalone component library (Tailwind + Radix) |
| `@rebasepro/postgresql` | PostgreSQL data source delegate |
| `@rebasepro/firebase` | Firebase/Firestore data source delegate |
| `@rebasepro/mongodb` | MongoDB data source delegate |
| `@rebasepro/editor` | Notion-style rich text editor |
| `@rebasepro/cli` | Developer CLI for deep project configurations and scaffolding |
| `@rebasepro/formex` | High-performance, lightweight React form management |

---

## Support & Community

- 📖 [Documentation](https://rebase.pro/docs)
- 💬 [Discord Community](https://discord.gg/fxy7xsQm3m)
- 🐛 [GitHub Issues](https://github.com/rebaseco/rebase/issues)
- 📝 [Changelog](https://rebase.pro/docs/changelog)

---

## Trusted By

Developers operating enterprise architectures at **Google**, **Microsoft**, **IKEA**, and thousands of open-source teams worldwide.

---

## License

Rebase is proudly open-source and licensed under the **MIT License**.
See the full [License](https://github.com/rebaseco/rebase/blob/main/LICENSE) for details.
