<p align="center">
  <a href="https://firecms.co">
    <img src="https://firecms.co/img/logo_small.png" width="240px" alt="FireCMS logo" />
  </a>
</p>

<h1 align="center">FireCMS</h1>
<h3 align="center">Awesome Firebase/Firestore-based headless CMS</h3>
<p align="center"><a href="https://demo.firecms.co">Live demo</a></p>

<br />

<p align="center">
    <img src="https://firecms.co/img/dark_mode.webp" alt="Intro video" style="max-width: 100%;">
</p>


[![NPM](https://img.shields.io/npm/v/@camberi/firecms.svg)](https://www.npmjs.com/package/@camberi/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

FireCMS is a headless CMS and admin panel, built by developers for developers.

It integrates by default with **Firebase and Firestore** but it can be used with
any backend.

It generates **CRUD views** based on your configuration. It is easy to set up
for the straight forward cases and easy to extend and customise.

The goal of this CMS is to generate collection and form views that bind nicely
to the collection/document model. We have built in many basic (and not so basic)
use cases; but FireCMS is built with extensibility in mind, so it is easy to
create your views or override the existing ones.

FireCMS does **not** enforce any data structure on your side, and works out of
the box with any project.

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

FireCMS has been meticulously built to make it extremely easy for developers to
build a CMS/admin tool. At the same time it offers the best data editing
experience and has an extremely thoughtful UX designed to make it super easy to
use, for marketers and content managers.

### 🏓 Awesome spreadsheet view

We have developed a super performant windowed **spreadsheet view** for
collections, where you can do inline editing on most of the common fields, and
have a popup view in the rest of the cases and your custom field
implementations.

It has **real-time** support, making it suitable for apps that need to be always
updated.

It also supports **text search** (through an external provider such as Algolia,
if you are using Firestore), as well as **filtering and sorting** and
**exporting** data

### ✨ Powerful forms

![fields](https://firecms.co/img/post_editing.png)

When editing an entity, FireCMS offers a nested system of side dialogs that
allow to navigate through **subcollections** and access custom views (such as a
custom form, or a blog preview). This functionality can be also accessed
programmatically though the hook `useSideEntityController`.

FireCMS includes **more than 15 built-in fields** with hundreds of customization
and validation options. The components have been meticulously crafted for a
great user experience, and we include advanced features such as **references**
to other collections, **markdown** or **arrays reordering**.

If your use case is not supported, you can build your own **custom field**, just
as any other React component.

It also supports **conditional fields** in forms, allowing for declaring rules
of what fields are active , based on your own logic.

### 👮 Authentication, permissions and role system

You will be able to define which navigation views can a user see, and the
operations (create, edit, delete) that can be executed on them, based on your
role system. You can even define this configuration on a per-entity or
collection level.

By default, all the authorization mechanisms of Firebase are supported, but you
are free to implement your own.

### 🏹 Relational support

You can define references to entities in other collections, and benefit from the
integrated reference fields and shortcuts included.

It is also possible to define subcollections at the entity level, so you can
nest data in a collection/document/collection model

### 🆒 Real time data

Every view in the CMS has real time data support. This makes
it suitable for displaying data that needs to be always updated.

Forms also support this feature, any modified value in the database will be
updated in any currently open form view, as long as it has not been touched by
the user. This allows for advanced cases where you trigger a Cloud
Function after saving an entity that modifies some values, and you want to get
real time updates.

### 🗂️ Files storage

FireCMS supports uploading files to Firebase Storage out of the box, and
provides specific fields for handling single and multiple file uploads, also
allowing for reordering.

You can change the Firebase Storage implementation with your own.

### 🙌 Your logic

You can add your custom logic or validation in multiple points of the user flow.
There are built-in hooks `onPreSave`, `onSaveSuccess`, `onSaveFailure`,
`onPreDelete` and `onDelete`.

FireCMS has a good separation of concerns. All the logic related to
Firebase/Firestore is abstracted away behind 3 interfaces: `DataSource`,
`StorageSource` and `AuthDelegate`. This means you can extend or even completely
replace those 3 implementations with your own.

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
`hello@camberi.com`

## License

MIT © [camberi](https://github.com/camberi)
