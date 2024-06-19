<p align="center">
    <img src="https://firecms.co/img/dark_mode.webp" alt="Intro video" style="max-width: 100%;"/>
</p>

<p align="center">
  <a href="https://firecms.co">
    <img src="https://firecms.co/img/logo_small.png" width="240px" alt="FireCMS logo" />
  </a>
</p>

<h1 align="center">FireCMS</h1>
<h3 align="center">Awesome Firebase/Firestore-based headless CMS</h3>
<p align="center"><a href="https://demo.firecms.co">Live demo</a></p>

<br />


[![NPM](https://img.shields.io/npm/v/firecms.svg)](https://www.npmjs.com/package/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**Important**: This package is a wrapper around the FireCMS CLI. It is

Designed by developers for developers, FireCMS is a headless CMS and admin panel
that seamlessly integrates with **Firebase and Firestore** by default, but is
also compatible with any backend.

Effortlessly generate **CRUD views** based on your configuration. FireCMS is
simple to set up for standard cases and easy to extend and customize for more specific
needs.

Built to produce collection and form views that naturally align with the
collection/document model, FireCMS covers a wide range of basic and advanced use
cases. With extensibility in mind, it's easy to create your own views or modify
existing ones.

FireCMS does **not impose any data structure** restrictions, ensuring a smooth,
out-of-the-box experience for any project.

### Core technologies

FireCMS is based on this great technologies:

- Typescript
- Tailwind CSS
- Firebase SDK 10
- React + React Router 6

### Quickstart

The easiest way to get going is to check our quickstart guide! You will just
need to follow some quick steps:

https://firecms.co/docs

## FireCMS CLI

This CLI tool allows you to create new FireCMS projects and to deploy them to FireCMS Cloud. You can install
it globally with:

```bash
npm install -g firecms
```

This way it will be available in your terminal as `firecms`.

### CLI

You can use the following commands:

```bash
firecms login
```

```bash
firecms init
```

```bash
firecms deploy
```

### Using different templates

You can initialize a new project using different templates. Please not that these templates can't
be deployed to FireCMS Cloud. For example:

For FireCMS Cloud

```bash
firecms init
```

For FireCMS PRO:

```bash
firecms init --pro
```


### Development only

You can change the environment when deploying to FireCMS Cloud by defining the --env variable.
Possible values are `prod` (default) and `dev`.

```bash
firecms deploy --env dev
```
