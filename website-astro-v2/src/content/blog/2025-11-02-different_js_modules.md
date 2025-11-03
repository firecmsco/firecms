---
slug: js_formats
title: All the different JS formats
description: A guide to understanding the various JavaScript module formats and their uses.
pubDate: 2025-11-02
authors: francesco
image: /img/blog/lautaro-andreani-UYsBCu9RP3Y-unsplash.jpg
---

![React Code](/img/blog/lautaro-andreani-UYsBCu9RP3Y-unsplash.jpg)


I love JavaScript.

But.

I hate JavaScript.

I love it because it's the language I use the most, and I hate it for the same reason. I actually use TypeScript 99% of the time, but since it transpiles to JavaScript, it's essentially the same thing.

There's one aspect I struggle with when working with JavaScript: the different module formats.

I'm not talking about the different frameworks, libraries, build tools, or coding styles. I'm talking specifically about the different **module formats** JavaScript can be written in.

It's easy to get confused when you start working with JavaScript because there are so many environments where you can use it. You can use it in the browser, in Node.js, in a service worker, in a React Native app, in an Electron app... the list goes on.

In any case, you'll need to both import and export code, and that's where the confusion starts.

Let's start with the most common format, the one you'll find in the browser: the ES module format.

## The Module Formats Landscape

When working with JavaScript, you'll encounter several module formats. Each was created to solve specific problems at
different times in JavaScript's evolution. Here's the complete breakdown:

### ES Modules (ESM)

**Also known as:** `es`, `esm`, `module`

ES Modules are the official standard for JavaScript modules, introduced in ES6 (ES2015). This is the modern way to
handle modules and is natively supported in modern browsers and Node.js (12+).

**Export syntax:**

```javascript
// Named exports
export const name = "FireCMS";
export function getData() { /* ... */ }

// Default export
export default class MyComponent { /* ... */ }

// Re-exporting
export { something } from './other-module.js';
export * from './another-module.js';
```

**Import syntax:**

```javascript
// Named imports
import { name, getData } from './module.js';

// Default import
import MyComponent from './component.js';

// Import everything
import * as utils from './utils.js';

// Dynamic imports
const module = await import('./module.js');
```

**Usage in HTML:**

```html
<script type="module" src="app.js"></script>
```

**When to use:** This is the format you should prefer for new projects. It's the standard and has the best tooling
support. Use it for modern web applications, Node.js applications, and any bundled code.

### CommonJS (CJS)

**Also known as:** `cjs`, `commonjs`

CommonJS is the module system used by Node.js traditionally. It uses `require()` for imports and `module.exports` for
exports. While Node.js now supports ESM, you'll still find tons of npm packages using CommonJS.

**Export syntax:**

```javascript
// Single export
module.exports = function myFunction() { /* ... */ };

// Multiple exports
module.exports = {
  name: "FireCMS",
  getData: function() { /* ... */ }
};

// Individual exports
exports.name = "FireCMS";
exports.getData = function() { /* ... */ };
```

**Import syntax:**

```javascript
// Import entire module
const module = require('./module');

// Destructure imports
const { name, getData } = require('./module');

// Import with different name
const myModule = require('./module');
```

**When to use:** When building Node.js applications that need to support older Node versions, or when working with
packages that only provide CommonJS builds. Most npm packages still ship CommonJS builds for compatibility.

**Important note:** You cannot use `require()` in ES modules, and you cannot use `import` in CommonJS files (unless you
rename to `.mjs` or configure Node properly).

### Universal Module Definition (UMD)

**Also known as:** `umd`

UMD is a pattern that attempts to offer compatibility with the most popular script loaders of the day (AMD, CommonJS,
and global variables). It's essentially a wrapper that detects which module system is available and uses it.

**Example UMD wrapper:**

```javascript
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['dependency'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory(require('dependency'));
    } else {
        // Browser globals
        root.MyLibrary = factory(root.Dependency);
    }
}(typeof self !== 'undefined' ? self : this, function (dependency) {
    // Module code here
    return {
        doSomething: function() { /* ... */ }
    };
}));
```

**When to use:** When you're building a library that needs to work in multiple environments without a build step.
However, with modern bundlers, UMD is becoming less necessary. Most modern libraries ship ESM and CJS builds and let the
bundler choose.

### Immediately Invoked Function Expression (IIFE)

**Also known as:** `iife`

IIFE is a design pattern where you wrap code in a function that immediately executes. This creates a private scope and
is often used to avoid polluting the global namespace.

**Syntax:**

```javascript
(function() {
    // Private scope
    const privateVar = "secret";
    
    function privateFunction() { /* ... */ }
    
    // Expose to global if needed
    window.MyLibrary = {
        publicMethod: function() {
            return privateFunction();
        }
    };
})();
```

**Modern arrow function syntax:**

```javascript
(() => {
    // Your code here
})();
```

**When to use:** When you want to create a bundle for direct inclusion in a browser via `<script>` tag without any
module system. Great for simple scripts or when you need maximum browser compatibility. Most build tools can generate
IIFE bundles.

### Asynchronous Module Definition (AMD)

**Also known as:** `amd`

AMD was designed for the browser and focuses on asynchronous loading. It was popular with RequireJS but has largely
fallen out of favor with modern bundlers.

**Export syntax:**

```javascript
define(['dependency1', 'dependency2'], function(dep1, dep2) {
    return {
        doSomething: function() {
            dep1.helper();
            dep2.utility();
        }
    };
});
```

**Import syntax:**

```javascript
require(['module'], function(module) {
    module.doSomething();
});
```

**When to use:** You probably shouldn't use AMD for new projects. It's mainly here for historical context. If you're
maintaining legacy code with RequireJS, you might encounter it.

### SystemJS Format

**Also known as:** `system`, `systemjs`

SystemJS is a universal module loader that can load ES modules, AMD, CommonJS and global scripts in the browser. It's
less common now but still used in some enterprise applications.

**When to use:** Primarily when working with SystemJS specifically, or when you need to load multiple module formats in
a browser environment. This is rare in modern development.

## Package.json Configuration

Modern packages often specify different entry points for different module formats:

```json
{
  "name": "my-package",
  "main": "./dist/index.cjs",           // CommonJS entry
  "module": "./dist/index.mjs",         // ESM entry for bundlers
  "exports": {
    ".": {
      "import": "./dist/index.mjs",     // ESM import
      "require": "./dist/index.cjs",    // CommonJS require
      "types": "./dist/index.d.ts"      // TypeScript types
    }
  },
  "type": "module"                      // Treat .js as ESM
}
```

## File Extensions Matter

- `.js` - Can be ESM or CommonJS depending on `package.json` "type" field
- `.mjs` - Always ES Module
- `.cjs` - Always CommonJS
- `.ts` - TypeScript (transpiles to one of the above)

## Modern Recommendations

1. **For new projects:** Use ES Modules (`.js` or `.mjs` with `"type": "module"`)
2. **For libraries:** Ship both ESM and CJS builds
3. **For browser scripts:** Use ESM with `<script type="module">` or bundle to IIFE
4. **For Node.js:** Use ESM for Node 14+ or CJS for older versions

## The Bottom Line

The JavaScript module landscape can be confusing, but here's the simple version:

- **ES Modules are the future** (and present) - use them when possible
- **CommonJS is the Node.js legacy** - you'll encounter it in older packages
- **UMD was the compatibility layer** - less needed with modern tooling
- **IIFE is for standalone scripts** - still useful for simple browser scripts
- **AMD is deprecated** - avoid for new projects

The good news? Modern build tools like Vite, Webpack, and Rollup handle most of this complexity for you. They let you
write in ES Modules and can output to any format you need.

Just remember: when in doubt, use ES Modules. It's the standard, and everything else is either legacy or a special use
case.

## Quick Reference

| Format   | Export                      | Import         | Best For                    |
|----------|-----------------------------|----------------|-----------------------------|
| ESM      | `export` / `export default` | `import`       | Modern projects             |
| CommonJS | `module.exports`            | `require()`    | Node.js, older npm packages |
| UMD      | Wrapper function            | Various        | Multi-environment libraries |
| IIFE     | Global variable             | `<script>` tag | Browser scripts             |
| AMD      | `define()`                  | `require()`    | Legacy RequireJS            |

Now you know all the different JavaScript formats! While the variety can be overwhelming, most modern development has
converged on ES Modules as the standard. Focus on learning ESM well, and you'll be set for most situations.
