## Rebase UI


**Rebase UI** is a high quality set of components that you can use to build your own custom views. You can
use these components to build your own Rebase views, or in any other React application. You just need to install
`tailwindcss` and the `@rebasepro/ui` package.

### Why build this UI kit?
Rebase was using MUI until version 3.0. MUI provides ready to use components with intuitive APIs, but it also
comes with a lot of complexity and overhead. We wanted to build a simpler and more flexible UI kit that could be used
in any React project, not just in Rebase.
We also wanted to make it easy to transition from MUI to our new UI kit, so we kept the API as similar as possible.
The result it a set of components that are easy to use, easy to customize, **much more performant** and with a smaller bundle size.

The components are primarily built using **Radix UI** primitives and **tailwindcss**. This means that you can easily customize them
using tailwindcss classes or override the styles using CSS.

See the full list of components in https://rebase.pro/docs/components


> All the components are exported from the `@rebasepro/ui` package. These are the same components used internally in **Rebase**.


## Installation

If you are using Rebase, you don't need to install this package, as it is already included, and
configured for you.

To use the components in your own project, you need to install the `@rebasepro/ui` package:

```bash
yarn add @rebasepro/ui
```
or
```bash
npm install @rebasepro/ui
```

You also need to install `tailwindcss`:

```bash
yarn add tailwindcss @tailwindcss/typography
```

And initialize it in your project:

```bash
npx tailwindcss init
```

And add then add the rebase preset in your `tailwind.config.js`:

```javascript
import rebaseConfig from "@rebasepro/ui/tailwind.config.js";

export default {
    presets: [rebaseConfig],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@rebasepro/**/src/**/*.{js,ts,jsx,tsx}"
    ]
};
```
(You might need to adjust the paths in the `content` array to match your project structure)

Finally, you need to define your primary and secondary colors in your `index.css` file:

```css
@import 'tailwindcss';
@import "@rebasepro/ui/index.css" layer(base);

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@source "../index.html";
@source "./**/*.{js,ts,jsx,tsx}";
@source "../node_modules/@rebasepro/**/*.{js,ts,jsx,tsx}";

:root {
    --color-primary: #0070F4;
    --color-secondary: #FF5B79;
}
```

