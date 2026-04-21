# Styling FireCMS

FireCMS allows you to customize the look and feel of your admin panel. You can
customize the theme, colors, and typography to match your brand.

FireCMS uses [Tailwind CSS v4](https://tailwindcss.com/) for styling. All configuration
is done directly in CSS using the `@theme` block — no `tailwind.config.js` is required
for most customizations.

### Setting up your CSS

Your `index.css` file should look like this:

```css
@import 'tailwindcss';
@import "@firecms/ui/index.css" layer(base);
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@plugin "@tailwindcss/typography";

@source "https://firecms.co/docs/index.html";
@source "https://firecms.co/docs/src/**/*.{js,ts,jsx,tsx}";
@source "https://firecms.co/docs/https://firecms.co/docs/https://firecms.co/docs/node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}";

:root {
    --color-primary: #0070F4;
    --color-secondary: #FF5B79;
}

body {
    @apply w-full min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col items-center justify-center;
}
```

Key points:
- `@import 'tailwindcss'` replaces the old `@tailwind base/components/utilities` directives.
- `@import "@firecms/ui/index.css" layer(base)` imports the FireCMS UI theme into the CSS `base` layer.
- `@custom-variant dark` sets up the dark mode variant using the `[data-theme=dark]` selector.
- `@plugin` replaces the old plugins array in `tailwind.config.js`.
- `@source` replaces the `content` array in `tailwind.config.js`, telling Tailwind where to scan for class names.

You may want to check the original [`index.css`](https://github.com/firecmsco/firecms/blob/main/packages/ui/src/index.css)
file in the `@firecms/ui` package.

### Customizing colors

#### Primary and secondary colors

FireCMS UI uses a primary color and a secondary color. You can override these in your `index.css`
by reassigning the CSS custom properties **after** importing the FireCMS UI styles:

```css
@import 'tailwindcss';
@import "@firecms/ui/index.css" layer(base);
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root {
    --color-primary: #0070F4;
    --color-secondary: #FF5B79;
}
```

These are the default values, but you can change them to match your brand.

#### Advanced color customization using `@theme`

In Tailwind v4, colors and other design tokens are defined directly in CSS using the `@theme` block.
FireCMS UI ships all its tokens this way. If you need to override the full color palette, add an
`@theme` override block in your `index.css`:

```css
@import 'tailwindcss';
@import "@firecms/ui/index.css" layer(base);
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@theme {
    --color-primary: #0070F4;
    --color-secondary: #FF5B79;

    /* Field Colors */
    --color-field-disabled: rgb(224 224 226);
    --color-field-disabled-dark: rgb(35 35 37);

    /* Text Colors */
    --color-text-primary: rgba(0, 0, 0, 0.87);
    --color-text-secondary: rgba(0, 0, 0, 0.52);
    --color-text-disabled: rgba(0, 0, 0, 0.38);
    --color-text-primary-dark: #ffffff;
    --color-text-secondary-dark: rgba(255, 255, 255, 0.6);
    --color-text-disabled-dark: rgba(255, 255, 255, 0.48);

    /* Surface Colors */
    --color-surface-50: #f8f8fc;
    --color-surface-100: #e7e7eb;
    --color-surface-200: #cfcfd6;
    --color-surface-300: #b7b7bf;
    --color-surface-400: #a0a0a9;
    --color-surface-500: #87878f;
    --color-surface-600: #6b6b74;
    --color-surface-700: #454552;
    --color-surface-800: #292934;
    --color-surface-900: #18181c;
    --color-surface-950: #101013;

    /* Surface Accent Colors */
    --color-surface-accent-50: #f8fafc;
    --color-surface-accent-100: #f1f5f9;
    --color-surface-accent-200: #e2e8f0;
    --color-surface-accent-300: #cbd5e1;
    --color-surface-accent-400: #94a3b8;
    --color-surface-accent-500: #64748b;
    --color-surface-accent-600: #475569;
    --color-surface-accent-700: #334155;
    --color-surface-accent-800: #1e293b;
    --color-surface-accent-900: #0f172a;
    --color-surface-accent-950: #020617;
}
```

FireCMS defines colors for all surfaces (a light gray by default), surface accents (a bluish gray by default),
typography colors (primary, secondary and disabled) as well as the field colors (background, hover, etc).

### Customizing typography

FireCMS uses the `Rubik` font by default, both for headings and body text. It also uses the `JetBrains Mono` font
for code blocks.

#### Adding new fonts

If you would like to add a new font, you can install it using `npm` or `yarn`.

For example, to add the `Noto Serif` font:

```bash
npm install @fontsource/noto-serif
```

or

```bash
yarn add @fontsource/noto-serif
```

and import it in your `App.tsx` file:
```tsx

export default {
    presets: [fireCMSConfig],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@firecms/**/*.{js,ts,jsx,tsx}"
    ]
};
```

### Do you miss any customization?

If you need to customize any other aspect of FireCMS, please [let us know](https://discord.gg/fxy7xsQm3m).

