
![logo](https://firecms.co/img/logo_small.png)

# FireCMS

> Awesome Firestore based headless CMS, developed by Camberi

FireCMS is a headless CMS and admin panel built by developers for developers. It
generates CRUD views based on your configuration. You define views that are
mapped to absolute or relative paths in your Firestore database, as well as
schemas for your entities.

The goal of this CMS is to generate collection and form views that bind nicely
to the Firestore collection/document model. We have built in many basic (and not
so basic) use cases; but FireCMS is build with extensibility in mind, so it is
easy to create your custom form fields, or your complete views.

Note that this is a full application, with routing enabled and not a simple
component.

[![NPM](https://img.shields.io/n4pm/v/@camberi/firecms.svg)](https://www.npmjs.com/package/@camberi/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### Core technologies

FireCMS is based on this great technologies:

- Typescript
- Firebase
- React + React Router
- Material UI
- Formik + Yup

### Quickstart

The easiest way to get going is to check our docs!

https://firecms.co

### Demo

Check the demo with all the core functionalities. You can modify the data, but
it gets periodically restored.

https://demo.firecms.co

### Changelog

https://github.com/Camberi/firecms/blob/master/CHANGELOG.md

## Install

In your React project, simply install the dependency.

```bash
npm install @camberi/firecms
```

or

```bash
yarn add @camberi/firecms
```

## Features

### CMS

- [x] Real-time Collection views for entities
- [x] Infinite scrolling in collections with optional pagination
- [x] Collection text search integration
- [x] Data export
- [x] Granular permissions based on user or specific collections/entities
- [x] All login methods supported by Firebase
- [x] Custom authenticator to control access
- [x] Custom additional views in main navigation
- [x] Filters for string, numbers and booleans
- [ ] Filters for arrays, dates
- [ ] Allow set up of a project using a CLI create-firecms-app

### Entity edition

- [x] Create, read, update, delete views
- [x] Form for editing entities
- [x] Implementation of fields for every property (except Geopoint)
- [x] Conditional fields in forms
- [x] Native support for Google Storage references and file upload.
- [x] Advanced validation for fields using yup
- [x] Inline editing
- [x] Hooks on pre and post saving and deletion of entities
- [x] Enhanced reference, and array of reference, fields for relational data
- [x] Drag and drop reordering of arrays
- [x] Custom fields defined by the developer.
- [x] Subcollection support

#### Included example

You can access the code for the demo project under
[`example`](https://github.com/Camberi/firecms/tree/master/example). It includes
every feature provided by this CMS.

## Provided hooks

FireCMS provides different hooks that allow you to interact with the internal
state of the app. Please note that in order to use this hook you **must** be in
a component (you can't use them directly from a callback function).


## Contact and support

https://www.reddit.com/r/firecms/
`francesco@camberi.com`

## License

GPL-3.0 © [camberi](https://github.com/camberi)
