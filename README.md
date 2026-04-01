<p align="center">
  <a href="https://firecms.co">
    <img src="https://firecms.co/img/logo_small.png" width="240px" alt="FireCMS - Firebase CMS & Firestore CMS" />
  </a>
</p>

<h1 align="center">FireCMS</h1>
<h3 align="center">The Open-Source Firebase CMS & Firestore Admin Panel Framework</h3>
<p align="center">
  The fastest way to build a back-office, admin panel, or headless CMS on top of Firebase & Firestore.<br/>
  Go live in minutes with <a href="https://app.firecms.co">FireCMS Cloud</a>, or self-host for full control.
</p>

<p align="center">
  <a href="https://demo.firecms.co">Live Demo</a> •
  <a href="https://firecms.co/docs">Documentation</a> •
  <a href="https://firecms.co/features">Features</a> •
  <a href="https://firecms.co/pricing">Pricing</a> •
  <a href="https://firecms.co/developers">For Developers</a> •
  <a href="https://discord.gg/fxy7xsQm3m">Discord</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@firecms/core"><img src="https://img.shields.io/npm/v/@firecms/core.svg?style=flat-square&color=orange" alt="NPM Version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-purple.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://www.npmjs.com/package/@firecms/core"><img src="https://img.shields.io/npm/dw/@firecms/core?style=flat-square&color=blue" alt="NPM Downloads" /></a>
  <a href="https://discord.gg/fxy7xsQm3m"><img src="https://img.shields.io/discord/1013768502458470442?style=flat-square&logo=discord&logoColor=white&label=Discord" alt="Discord" /></a>
</p>

<br/>

<p align="center">
  <img src="https://firecms.co/img/demo_products.png" width="800px" alt="FireCMS - Firebase CMS and Firestore admin panel" />
</p>

> ⭐ **If FireCMS saves you time, please consider [starring this repo](https://github.com/firecmsco/firecms) — it helps more developers discover it!**

---

## What is FireCMS?

**FireCMS** is a **developer-first**, open-source **Firebase CMS** and **Firestore admin panel** framework built with **React** and **TypeScript**.

It connects natively to **Firebase & Firestore** (and MongoDB) and auto-generates powerful CRUD interfaces, forms, and data management tools from your schema — giving you a production-ready **Firestore CMS** in minutes, not weeks.

Whether you need a headless CMS for Firebase, an internal admin tool, or a full-featured back-office application, FireCMS adapts to your workflow:

- **[FireCMS Cloud](https://firecms.co/pricing)** — fully managed SaaS, zero setup. Connect your Firebase project and go live instantly.
- **Self-Hosted (Community / PRO)** — deploy anywhere. Full source access, MIT licensed core. Perfect for [agencies](https://firecms.co/agencies) and custom builds.

Trusted by teams at **Google**, **Microsoft**, and **IKEA** — and thousands of developers worldwide.

---

### ✨ Key Highlights

- 🔥 **Native Firebase & Firestore integration** — real-time data, Firebase Auth, and Firebase Storage out of the box
- 🤖 **AI-powered features** — autofill fields with GPT/Gemini, generate collections with AI, and query data with natural language ([DataTalk](https://firecms.co/features))
- 🎨 **Visual schema editor** — build and modify Firestore data models from the UI, with automatic schema inference from existing collections
- ✍️ **Notion-style rich text editor** — block-based content editing with slash commands and AI autocomplete
- ⚡ **Blazing fast** — built on Tailwind CSS v4, replacing the old MUI/emotion stack
- 🧩 **Radical extensibility** — custom React fields, views, hooks, and full theme control
- 🔒 **[Security by design](https://firecms.co/security)** — your data stays in your Firebase project. No vendor lock-in.

---

## Quick Start

### FireCMS Cloud — Fastest Path to a Firebase CMS

Get a fully managed Firebase CMS connected to your Firestore project — no deployment, no maintenance:

```
👉 https://app.firecms.co
```

*Free 1-month trial. No credit card required.*

### Self-Hosted Firestore CMS

Scaffold a new self-hosted project in seconds:

```bash
npx create-firecms-app
```

Or with yarn / pnpm:

```bash
yarn create firecms-app
pnpm create firecms-app
```

→ [Full self-hosted setup guide](https://firecms.co/docs)

---

## Features

### 🏓 Spreadsheet-Style Firestore Collection View

An incredibly fast, windowed spreadsheet view with inline editing, real-time updates, filtering, sorting, and text search. Switch between **spreadsheet table**, **card grid**, and **Kanban board** — automatically available for collections with enum properties.

### 🤖 AI-Powered Firebase Data Management

- **AI Autofill** — generate titles, descriptions, translations, and more using context-aware prompts powered by OpenAI and Google Gemini
- **AI Collection Generation** — describe your Firestore data model in natural language and let AI build your schema
- **DataTalk** — query and update your Firestore data using natural language. Ask things like *"Show all products over $100"* or *"Update all out-of-stock items"*

→ [Explore all AI features](https://firecms.co/features)

### 🎨 Visual Schema Editor & Firestore Data Inference

Design your Firestore data models visually with **20+ field types** and advanced validation rules. Or connect to an existing Firestore/MongoDB database and let FireCMS **automatically infer your schema** — go from zero to admin panel in minutes.

### ✍️ Notion-Style Rich Text Editor

A beautiful block-based editor with slash commands, drag-and-drop blocks, keyboard shortcuts, and AI-powered text completion. Built on TipTap v3.

### 📥📤 Data Import & Export

Import data from **CSV, JSON, and Excel** with an intuitive field mapper and validation UI. Export Firestore collections to CSV or JSON with customizable date formats and array serialization.

### ✨ Robust Forms & Custom Fields

Over **20 built-in field types** including Firestore references, markdown, file uploads, arrays, maps, enums, date/time, geopoints, and more. Create **custom fields** as React components for anything else. Supports **conditional fields**, **validation rules**, and a **Notion-style content editor**.

### 🖥️ Full-Screen & Side Panel Entity Views

Edit Firestore documents in a side panel or expand to full-screen. Navigate through subcollections, access custom views, and build **secondary forms** — all with undo/redo support and local draft persistence.

### 🕐 Entity History & Audit Trail

Track every Firestore document change with built-in history. Compare versions, see who changed what and when, and safely revert to previous states.

### 👮 Roles, Permissions & User Management

Granular role-based access control for collections, fields, and actions. Manage users and roles directly from the UI, or define permissions programmatically in code.

→ [Learn about permissions & security](https://firecms.co/security)

### 🔄 Real-Time Firestore Data

Every view — collections, forms, and custom views — supports real-time Firestore updates. Changes sync instantly across all connected users.

### 🗂️ Firebase Storage Integration

Seamless integration with Firebase Storage for images, videos, and documents. Supports file uploads, drag-and-drop, image resizing, and custom storage implementations.

### 🧩 Custom Views & React Extensibility

Build entirely custom views (dashboards, previews, analytics) as React components and add them to the main navigation or as entity-level tabs. Use built-in hooks like `useSideEntityController`, `useSnackbarController`, and `useAuthController` to interact with FireCMS.

→ [Developer documentation](https://firecms.co/developers)

### 🎨 Component Library (`@firecms/ui`)

A standalone, production-ready component library built on **Tailwind CSS** and **Radix UI**. Fully typed, accessible, and customizable. Use it in FireCMS or in any React project:

```bash
npm install @firecms/ui
```

→ [Browse UI components](https://firecms.co/ui)

### 🏠 Customizable Firebase CMS Home Page

Organize Firestore collections into groups with drag-and-drop, favorites, and search. Supports custom branding, logos, and themes.

### 🖥️ CLI

Deploy custom code to FireCMS Cloud with a single command:

```bash
firecms deploy
```

---

## Core Technologies

| Technology | Version |
|---|---|
| TypeScript | 5.x |
| React | 18+ |
| Tailwind CSS | v4 |
| Firebase | 12 |
| Radix UI | Latest |
| TipTap | v3 |

---

## Editions

| | **Community** | **PRO** | **Cloud** |
|---|---|---|---|
| License | MIT | BSL | Managed |
| Hosting | Self-hosted | Self-hosted | Fully managed |
| Schema editor UI | ❌ | ✅ | ✅ |
| AI features | ❌ | ✅ | ✅ |
| DataTalk | ❌ | ✅ | ✅ |
| Entity history | ❌ | ✅ | ✅ |
| User management UI | ❌ | ✅ | ✅ |
| Custom views & fields | ✅ | ✅ | ✅ |
| Data import/export | ❌ | ✅ | ✅ |
| Content history audit trail | ❌ | ✅ | ✅ |
| MongoDB support | ❌ | ✅ | ❌ |
| Custom branding | ✅ | ✅ | ✅ |

→ [See full pricing & feature comparison](https://firecms.co/pricing)

---

## Who Uses FireCMS?

FireCMS is used across a wide range of use cases:

- **[Startups](https://firecms.co/startups)** — launch an MVP back-office in minutes, not weeks
- **[Agencies](https://firecms.co/agencies)** — deliver custom, white-labeled admin panels to clients
- **[Developers](https://firecms.co/developers)** — build internal tools with React + TypeScript + Firestore
- **Enterprise teams** — manage mission-critical data with fine-grained permissions and audit trails

Trusted by engineers at **Google**, **Microsoft**, **IKEA**, and thousands of companies worldwide.

---

## Demo

Explore the live demo — you can modify data freely, it gets periodically restored:

**👉 [demo.firecms.co](https://demo.firecms.co)**

---

## Packages

FireCMS is organized as a modular monorepo:

| Package | Description |
|---|---|
| `@firecms/core` | Core CMS framework, types, hooks, and components |
| `@firecms/ui` | Standalone component library (Tailwind + Radix) |
| `@firecms/firebase` | Firebase/Firestore data source delegate |
| `@firecms/cli` | CLI for project scaffolding and deployment |
| `@firecms/collection_editor` | Visual schema/collection editor |
| `@firecms/data_import` | Data import plugin (CSV, JSON, Excel) |
| `@firecms/data_export` | Data export plugin (CSV, JSON) |
| `@firecms/entity_history` | Entity history & audit trail plugin |
| `@firecms/user_management` | User & role management plugin |
| `@firecms/datatalk` | Natural language data queries (AI) |
| `@firecms/data_enhancement` | AI-powered field autofill |
| `@firecms/schema_inference` | Automatic schema inference from Firestore data |
| `@firecms/formex` | Lightweight form management library |
| `@firecms/mongodb` | MongoDB data source delegate |

---

## Support & Community

- 📖 [Documentation](https://firecms.co/docs)
- 💬 [Discord Community](https://discord.gg/fxy7xsQm3m)
- 🐛 [GitHub Issues](https://github.com/firecmsco/firecms/issues)
- 📝 [Changelog](https://firecms.co/docs/changelog)
- 📧 Contact: `hello@firecms.co`

---

## License

The core of FireCMS is licensed under the **MIT License**.
Some packages used in FireCMS PRO and Cloud are licensed under the **Business Source License 1.1 (BSL)**.
See the full [License](https://github.com/firecmsco/firecms?tab=License-1-ov-file#readme) for details.
