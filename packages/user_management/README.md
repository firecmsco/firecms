<p align="center">
  <a href="https://firecms.co">
    <img src="https://firecms.co/img/logo_small.png" width="240px" alt="FireCMS logo" />
  </a>
</p>

<h1 align="center">FireCMS</h1>
<h3 align="center">Awesome Firebase/Firestore-based headless CMS</h3>
<p align="center"><a href="https://demo.firecms.co">Live demo</a></p>

<br />


[![NPM](https://img.shields.io/npm/v/firecms.svg)](https://www.npmjs.com/package/firecms) [![License: MIT](https://img.shields.io/badge/license-MIT-purple.svg)](https://opensource.org/licenses/MIT)

FireCMS is a headless CMS and admin panel
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

### Demo

Check the demo with all the core functionalities.

https://demo.firecms.co

> You can modify the data, but it gets periodically restored.

### Getting started

The easies way to get started is through [FireCMS Cloud](https://app.firecms.co/).
Bring your project or create a new one in seconds.

It will allow you to get started without writing a single line of code. Create collections
and entities, and start editing your data.

Later on, if you need to customize the CMS, you can build and compile your own views, form fields
and other components, and upload them to your project.

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

### 📥📤 Data import and export

FireCMS supports importing and exporting data in CSV format as well as JSON.
Bring your data from other sources or export it to use it in other systems.

We offer a robust and flexible system for defining the import and export
configuration, allowing you to define the fields to be imported/exported, the
format, and the mapping between the fields in the file and the fields in the
collection.

### ✨ Robust Forms

![fields](https://firecms.co/img/form_editing.webp)

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

## Contact and support

If you need general support, you can open a [GitHub issue](https://github.com/firecmsco/firecms/issues) or join
our [Discord channel](https://discord.gg/fxy7xsQm3m).

Do you need consulting setting up your Firestore-based CMS in no time? We are
happy to help!
`hello@firecms.co`

## Changelog

https://firecms.co/docs/changelog

## License

MIT © [FireCMS](https://github.com/FireCMSco)
