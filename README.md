<p align="center">
  <a href="https://firecms.co">
    <img src="https://firecms.co/img/logo_small.png" width="240px" alt="FireCMS logo" />
  </a>
</p>

<h1 align="center">FireCMS</h1>
<h3 align="center">The Headless CMS & Admin Panel Framework for Firebase</h3>
<p align="center">
  Build powerful back-office apps in minutes.<br/>
  Go live instantly with <a href="https://app.firecms.co">FireCMS Cloud</a>, or self-host for full control.
</p>

<p align="center">
  <a href="https://demo.firecms.co">Live Demo</a> •
  <a href="https://firecms.co/docs">Documentation</a> •
  <a href="https://firecms.co/features">Features</a> •
  <a href="https://firecms.co/pricing">Pricing</a> •
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
  <img src="https://firecms.co/img/demo_products.png" width="800px" alt="FireCMS " />
</p>

---

## What is FireCMS?

FireCMS is a **developer-first**, open-source headless CMS and admin panel framework built with **React** and **TypeScript**. It connects natively to **Firebase & Firestore** (with MongoDB support too) and generates powerful CRUD views, forms, and data management tools from your schema configuration.

It's designed for developers who want full control and extensibility, while providing an exceptional editing experience for non-technical users.

### ✨ Key Highlights

- 🔥 **Native Firebase & Firestore integration** — real-time data, auth, and storage out of the box
- 🤖 **AI-powered features** — autofill fields with GPT/Gemini, generate collections with AI, and query data with natural language (DataTalk)
- 🎨 **Visual schema editor** — build and modify data models from the UI, with automatic schema inference from existing data
- ✍️ **Notion-style rich text editor** — block-based content editing with slash commands and AI autocomplete
- ⚡ **Blazing fast** — built on Tailwind CSS (v4) for maximum performance, replacing the old MUI/emotion stack
- 🧩 **Radical extensibility** — if you can build it in React, you can build it in FireCMS

---

## Quick Start

### FireCMS Cloud (Fastest)

Get a fully managed CMS connected to your Firebase project — no deployment, no maintenance:

```
👉 https://app.firecms.co
```

### Self-Hosted

Scaffold a new project in seconds:

```bash
npx create-firecms-app
```

Or with yarn / pnpm:

```bash
yarn create firecms-app
pnpm create firecms-app
```

---

## Features

### 🏓 Spreadsheet-Style Collection View

An incredibly fast, windowed spreadsheet view with inline editing, real-time updates, filtering, sorting, and text search. Switch between multiple view modes: **spreadsheet table**, **card grid**, and **Kanban board** — automatically available for collections with enum properties.

### 🤖 AI-Powered Data Management

- **AI Autofill** — generate titles, descriptions, translations, and more using context-aware prompts powered by OpenAI and Google Gemini
- **AI Collection Generation** — describe your data model in natural language and let AI build your schema
- **DataTalk** — query and update your data using natural language. Ask things like *"Show all products over $100"* or *"Update all out-of-stock items"*

### 🎨 Visual Schema Editor & Data Inference

Design your data models visually with **20+ field types** and advanced validation rules. Or, connect to an existing Firestore/MongoDB database and let FireCMS **automatically infer your schema** — go from zero to admin panel in minutes.

### ✍️ Notion-Style Rich Text Editor

A beautiful block-based editor with slash commands, drag-and-drop blocks, keyboard shortcuts, and AI-powered text completion. Built on TipTap v3.

### 📥📤 Data Import & Export

Import data from **CSV, JSON, and Excel** with an intuitive field mapper and validation UI. Export collections to CSV or JSON with customizable date formats and array serialization.

### ✨ Robust Forms & Custom Fields

Over **20 built-in field types** including references, markdown, file uploads, arrays, maps, enums, date/time, geopoints, and more. Create **custom fields** as React components for anything else. Supports **conditional fields**, **validation rules**, and a **Notion-style content editor**.

### 🖥️ Full-Screen & Side Panel Entity Views

Edit entities in a side panel or expand to full-screen mode. Navigate through subcollections, access custom views, and build **secondary forms** — all with undo/redo support and local draft persistence.

### 🕐 Entity History & Audit Trail

Track every change with built-in history. Compare versions, see who changed what and when, and safely revert to previous states.

### 👮 Roles, Permissions & User Management

Granular role-based access control for collections, fields, and actions. Manage users and roles directly from the UI, or define permissions programmatically in code.

### 🔄 Real-Time Data

Every view — collections, forms, and custom views — supports real-time updates. Changes sync instantly across all connected users.

### 🗂️ File Storage

Seamless integration with Firebase Storage for images, videos, and documents. Supports file uploads, drag-and-drop, image resizing, and custom storage implementations.

### 🧩 Custom Views & React Extensibility

Build entirely custom views (dashboards, previews, analytics) as React components and add them to the main navigation or as entity-level tabs. Use built-in hooks like `useSideEntityController`, `useSnackbarController`, and `useAuthController` to interact with FireCMS.

### 🎨 Component Library (`@firecms/ui`)

A standalone, production-ready component library built on **Tailwind CSS** and **Radix UI**. Fully typed, accessible, and customizable. Use it in FireCMS or in any React project:

```bash
npm install @firecms/ui
```

### 🏠 Customizable Home Page

Organize collections into groups with drag-and-drop, favorites, and search. Supports custom branding, logos, and themes.

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

→ [See full pricing & comparison](https://firecms.co/pricing)

---

## Demo

Explore the live demo with all core features — you can modify data, it gets periodically restored:

**👉 [demo.firecms.co](https://demo.firecms.co)**

---

## Packages

FireCMS is organized as a modular monorepo:

| Package | Description |
|---|---|
| `@firecms/core` | Core CMS framework, types, hooks, and components |
| `@firecms/ui` | Standalone component library (Tailwind + Radix) |
| `@firecms/firebase` | Firebase/Firestore data source delegate |
| `@firecms/editor` | Notion-style rich text editor |
| `@firecms/cli` | CLI for project scaffolding and deployment |
| `@firecms/collection_editor` | Visual schema/collection editor |
| `@firecms/data_import` | Data import plugin (CSV, JSON, Excel) |
| `@firecms/data_export` | Data export plugin (CSV, JSON) |
| `@firecms/entity_history` | Entity history & audit trail plugin |
| `@firecms/user_management` | User & role management plugin |
| `@firecms/datatalk` | Natural language data queries (AI) |
| `@firecms/data_enhancement` | AI-powered field autofill |
| `@firecms/schema_inference` | Automatic schema inference from data |
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

## Trusted By

Developers at **Google**, **Microsoft**, **IKEA**, and thousands of companies worldwide.

---

## License

The core of FireCMS is licensed under the **MIT License**.
Some packages used in FireCMS PRO and Cloud are licensed under the **Business Source License 1.1 (BSL)**.
See the full [License](https://github.com/firecmsco/firecms?tab=License-1-ov-file#readme) for details.
