<p align="center">
    <img src="https://rebase.pro/img/dark_mode.webp" alt="Intro video" style="max-width: 100%;"/>
</p>

<p align="center">
  <a href="https://rebase.pro">
    <img src="https://rebase.pro/img/logo_small.png" width="240px" alt="Rebase logo" />
  </a>
</p>

<h1 align="center">Rebase</h1>
<h3 align="center">Awesome Firebase/MongoDB-based headless CMS</h3>
<p align="center"><a href="https://demo.rebase.pro">Live demo</a></p>

<br />


[![NPM](https://img.shields.io/npm/v/rebase.svg)](https://www.npmjs.com/package/rebase) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**Important**: This package is a wrapper around the Rebase CLI. It is

Designed by developers for developers, Rebase is a headless CMS and admin panel
that seamlessly integrates with **Firebase and Firestore** by default, but is
also compatible with any backend.

Effortlessly generate **CRUD views** based on your configuration. Rebase is
simple to set up for standard cases and easy to extend and customize for more specific
needs.

Built to produce collection and form views that naturally align with the
collection/document model, Rebase covers a wide range of basic and advanced use
cases. With extensibility in mind, it's easy to create your own views or modify
existing ones.

Rebase does **not impose any data structure** restrictions, ensuring a smooth,
out-of-the-box experience for any project.

### Core technologies

Rebase is based on this great technologies:

- Typescript
- Tailwind CSS
- Firebase SDK 10
- React + React Router 6

### Quickstart

The easiest way to get going is to check our quickstart guide! You will just
need to follow some quick steps:

https://rebase.pro/docs

## Rebase CLI

This CLI tool allows you to create new Rebase projects and to deploy them to Rebase Cloud. You can install
it globally with:

```bash
npm install -g rebase
```

This way it will be available in your terminal as `rebase`.

### CLI

You can use the following commands:

```bash
rebase login
```

```bash
rebase init
```

```bash
rebase deploy
```

### Using different templates

You can initialize a new project using different templates. Please not that these templates can't
be deployed to Rebase Cloud. For example:

For Rebase Cloud

```bash
rebase init
```

For Rebase PRO:

```bash
rebase init --pro
```


### Development only

You can change the environment when deploying to Rebase Cloud by defining the --env variable.
Possible values are `prod` (default) and `dev`.

```bash
rebase deploy --env dev
```
