# FireCMS Astro Example

This is an [Astro](https://astro.build) project that demonstrates how to integrate [FireCMS](https://firecms.co) into an Astro application using the React integration.

## Getting Started

Install the dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:4321/cms](http://localhost:4321/cms) with your browser to access the FireCMS dashboard.

## Project Structure

```
src/
├── cms/                    # FireCMS React components
│   ├── App.tsx             # Main FireCMS app component
│   ├── CMSRoute.tsx        # Client-side routing wrapper
│   ├── collections/        # Firestore collection definitions
│   │   ├── products.tsx
│   │   ├── blog.tsx
│   │   ├── users_collection.tsx
│   │   └── locales.tsx
│   └── views/
│       └── ExampleCMSView.tsx
├── common/                 # Shared config and types
│   ├── firebase_config.ts
│   └── types.ts
├── pages/                  # Astro pages (file-based routing)
│   ├── index.astro         # Redirects to /cms
│   └── cms/
│       └── [...path].astro # Catch-all route for FireCMS
└── styles/
    └── index.css           # Tailwind CSS + FireCMS styles
```

## How It Works

Astro renders pages statically by default, but FireCMS is a fully interactive React application that requires client-side rendering. This example uses Astro's `client:only="react"` directive to render the CMS entirely on the client side, avoiding SSR for components that depend on browser APIs like `window` and `BrowserRouter`.

The catch-all route `[...path].astro` ensures all CMS sub-routes (`/cms/products`, `/cms/blog`, etc.) are handled by the React Router inside FireCMS.

## License

The data enhancement, user management and import/export plugins are FireCMS PRO
features, so a deployed CMS needs a license key. You can get one at
[firecms.co](https://app.firecms.co/subscriptions). Set it as `PUBLIC_FIRECMS_API_KEY`
in the `.env` file; it is passed to the `apiKey` prop of `<FireCMS>` in `src/cms/App.tsx`.

Astro inlines `PUBLIC_` variables into the client bundle at build time, so if your host
sets environment variables, set it there before building.

## Learn More

- [FireCMS Documentation](https://firecms.co/docs)
- [Astro Documentation](https://docs.astro.build)
- [Astro React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)

## Deploy

You can deploy this Astro app to any static hosting provider or use SSR adapters for platforms like Netlify, Vercel, or Cloudflare.
