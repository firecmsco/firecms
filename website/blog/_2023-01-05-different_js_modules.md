---
slug: js_formats
title: All the different JS formats
author: Francesco Gatti
image: /img/avatars/francesco_avatar.jpg
author_url: https://www.linkedin.com/in/fgatti675
author_image_url: https://avatars.githubusercontent.com/u/5120271?v=4
---

I love Javascript.

But.

I hate Javascript.

I love it because it's the language that I use the most, and I love it because
it's the language that I use the most. I actually use Typescript 99% of the
time, but it transpiles to Javascript, so it's the same.

There is one thing I struggle with when working with it, and that is the
different formats that it can be used in.

I'm not talking about the different frameworks, or the different libraries, or
the different build tools, or the different ways to write it. I'm talking about
the different formats that it can be used in.

It is easy to get confused when you start working with Javascript, because
there are so many ways to use it. You can use it in the browser,
you can use it in Node, you can use it in a
service worker, you can use it in a React Native app, you can use it in a
Electron app... the list goes on.

In any case you will need both to import and to export something, and that's
where the confusion starts.

Let's start with the most common format, the one that you will find in the
browser, and that is the ES module format.



amd – Asynchronous Module Definition, used with module loaders like RequireJS

cjs – CommonJS, suitable for Node and other bundlers (alias: commonjs)

es – Keep the bundle as an ES module file, suitable for other bundlers and
inclusion as a `<script type=module>` tag in modern browsers (alias: esm, module)

iife – A self-executing function, suitable for inclusion as a `<script>` tag. (If
you want to create a bundle for your application, you probably want to use
this.). "iife" stands for "immediately-invoked Function Expression"

umd – Universal Module Definition, works as amd, cjs and iife all in one
system – Native format of the SystemJS loader (alias: systemjs)
