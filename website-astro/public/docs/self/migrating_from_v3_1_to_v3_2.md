# Migrating from v3.1 to v3.2

This migration guide applies to **self-hosted versions** of FireCMS, including both **Community** and **PRO** editions.
FireCMS v3.2 brings a complete rewrite of the text editor, comprehensive internationalization support, and several important improvements.

## Before You Start

- Ensure you are currently on **FireCMS v3.1.x**
- Back up your project or commit your current state to version control
- Ensure you are using **Node.js 18+**

## Update FireCMS Packages

Update all `@firecms/*` packages to version **3.2**:

```bash
npm i @firecms/core@3.2.0 @firecms/ui@3.2.0 @firecms/firebase@3.2.0 @firecms/collection_editor@3.2.0 @firecms/collection_editor_firebase@3.2.0 @firecms/data_enhancement@3.2.0 @firecms/data_export@3.2.0 @firecms/data_import@3.2.0 @firecms/datatalk@3.2.0 @firecms/schema_inference@3.2.0 @firecms/user_management@3.2.0
```

Make sure to include **all** `@firecms/*` packages listed in your `package.json`. Mixing package versions will cause runtime errors.

---

## Editor Package Consolidation (Breaking Change)

The standalone `@firecms/editor` package has been deprecated and removed. All editor components have been migrated directly into `@firecms/core`.

:::caution
This is a **breaking change**. You must update your dependencies and imports.
:::

### 1. Remove the old package

Remove `@firecms/editor` from your project:

```bash
npm uninstall @firecms/editor
```

### 2. Update imports

Update any imports in your code that previously referenced `@firecms/editor` to import from `@firecms/core` instead:

**Before (v3.1):**
```typescript

```

**After (v3.2):**
```typescript

```

---

## Rich Text Editor Rewrite

The rich text editor has been completely reimplemented using ProseMirror to provide a more robust and feature-rich editing experience.

### Key Editor Features:
- **Table Support**: Full support for tables with markdown parsing, slash command insertion, and a dedicated table bubble UI.
- **Image Handling**: A new image bubble allows editing image alt/title attributes and offers enhanced upload capabilities.
- **Markdown Mode**: A new toggle allows you to seamlessly switch between rich text mode and raw markdown editing mode.
- **Improved Slash Commands**: The slash command menu (`/`) now features better HTML parsing and stability.
- **Better Pasting**: Significantly improved paste behavior for text and images.

---

## Internationalization (i18n)

FireCMS now features full i18next integration with comprehensive translation coverage across the entire platform.

### Add the i18n Provider

To enable internationalization, you **must** wrap your application in the new `FireCMSi18nProvider` exported from `@firecms/core`. This provider is now required and provides the active locale and translations to all FireCMS components.

```tsx

// ...

return (
    <FireCMSi18nProvider>
        <FireCMS
            // your configuration
        />
    </FireCMSi18nProvider>
);
```

Supported languages out-of-the-box now include:
- English
- Portuguese
- German
- French
- Spanish
- Italian
- Hindi

Translations have been extended to cover project settings, subscription management, AppCheck, security rules, and text search features.

---

## URL-Synchronized Table Filters

Table filters and sorting are now **synchronized with URL parameters**. 

When applying filters or sorting to a collection table, the URL automatically updates. This allows you to:
- Bookmark specific filtered views of your data.
- Share exact table states (including active filters and sort order) with your team via URLs.
- Navigate back and forth in your browser history while maintaining the correct table state.

---

## Other Features & Improvements

### CLI Updates
- **Astro Template**: The FireCMS CLI now includes a new Astro template for creating Astro-based projects seamlessly.

### Storage
- **Upload Progress**: Added upload progress indicators for file uploads, improving visibility for large media files.

### Collection Management
- **Error Banner**: Introduced a dedicated `CollectionDataErrorBanner` that displays collection data loading errors and provides helpful Firestore index suggestions.
- **Tabs Component**: Added scrollable Tabs with scroll indicator icons for better UX on smaller screens or configurations with many tabs.

---

## Troubleshooting

### Build errors related to `@firecms/editor`
Ensure you have completely removed the `@firecms/editor` package from your `node_modules` and `package.json`. You may need to delete `node_modules` and your lockfile, then run `npm install` again. Check all files for leftover imports from `@firecms/editor`.

### Type mismatch errors
Ensure **all** `@firecms/*` packages in your `package.json` are on exactly version `3.2.0`. Mixing v3.1 and v3.2 packages is the most common cause of build issues.

