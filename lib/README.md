<p align="center">
    <img src="https://firecms.co/img/dark_mode.webp" alt="Intro video" style="max-width: 100%;">
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

Designed by developers for developers, FireCMS is a headless CMS and admin panel
that seamlessly integrates with **Firebase and Firestore** by default, but is
also
compatible with any backend.

Effortlessly generate **CRUD views** based on your configuration. FireCMS is
simple
to set up for standard cases and easy to extend and customize for more specific
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
- Firebase SDK 9
- React + React Router 6
- Material UI 5
- Formik + Yup

### Quickstart

The easiest way to get going is to check our quickstart guide! You will just
need to follow some quick steps:

https://firecms.co/docs/quickstart

### Demo

Check the demo with all the core functionalities.

https://demo.firecms.co

> You can modify the data, but it gets periodically restored.

### Changelog

https://firecms.co/docs/changelog

## Features

FireCMS has been meticulously crafted to make it incredibly easy for developers
to build a CMS/admin tool while offering an excellent data editing experience
and a user-friendly interface for marketers and content managers.

### 🏓 Exceptional Spreadsheet View

We've developed a highly efficient windowed **spreadsheet view** for
collections, allowing inline editing for most common fields, as well as popup
views for other cases and your custom field implementations.

Featuring **real-time** support, FireCMS is perfect for apps that require
constant updates. It also supports **text search** (through an external provider
like Algolia, if using Firestore), **filtering and sorting**, and **exporting**
data.

### ✨ Robust Forms

![fields](https://firecms.co/img/post_editing.png)

When editing an entity, FireCMS offers a nested system of side dialogs for
navigating through **subcollections** and accessing custom views (such as custom
forms or blog previews). This functionality can also be accessed
programmatically using the `useSideEntityController` hook.

FireCMS includes **over 15 built-in fields** with numerous customization and
validation options. The components have been carefully designed for an
outstanding user experience, including advanced features like **references** to
other collections, **markdown**, and **array reordering**.

For unsupported use cases, create your own **custom field** as a React
component.

FireCMS also supports **conditional fields** in forms, allowing you to define
rules for active fields based on your logic.

### 👮 Authentication, Permissions, and Role System

Define which navigation views users can see and the operations (create, edit,
delete) they can perform based on your role system. You can even configure this
on a per-entity or collection level.

By default, FireCMS supports all Firebase authorization mechanisms, but you can
implement your own.

### 🏹 Relational Support

Define references to entities in other collections and benefit from the
integrated reference fields and shortcuts.

You can also define subcollections at the entity level for nesting data in a
collection/document/collection model.

### 🆒 Real-Time Data

Every view in the CMS supports real-time data, making it suitable for displaying
constantly updated information.

Forms also support this feature, with any modified value in the database being
updated in any open form view as long as it hasn't been touched by the user.
This enables advanced cases where a Cloud Function is triggered after saving an
entity, modifying some values, and requiring real-time updates.

### 🗂️ File Storage

FireCMS supports uploading files to Firebase Storage out of the box and provides
specific fields for handling single and multiple file uploads, as well as
reordering.

You can replace the Firebase Storage implementation with your own.

## Included example

You can access the code for the demo project under
[`example`](https://github.com/Camberi/firecms/tree/master/example). It includes
every feature provided by this CMS.

Keep in mind you need to update the dependencies in that project if you want to
use it as it is, without linking it to the library source code. More details in
its README

## Contact and support

If you need general support, you can open a GitHub issue.

Do you need consulting setting up your Firestore-based CMS in no time? We are
happy to help!
`hello@firecms.co`

## Development

If you would like to make changes to the source, feel free to submit a PR!

When developing, the core library can be found under `lib`.
There is an example project in the folder `example`.

In order to run the project, you need to create a file
called `firebase_config.ts`
in `example/src`.

That file needs to export a valid Firebase config, that you can get
from your Firebase console when creating a webapp for your project.

Then simply run `yarn` and `yarn dev`

## License

MIT © [camberi](https://github.com/camberi)
