---
id: intro
title: Introduction
sidebar_label: Introduction
slug: /
---

FireCMS is a headless CMS and admin panel built by developers for developers. It
generates CRUD views based on your configuration. You define views that are
mapped to absolute or relative paths in your Firestore database, as well as
schemas for your entities.

The goal of this CMS is to generate collection and form views that bind nicely
to the Firestore collection/document model. We have built in many basic (and not
so basic) use cases; but FireCMS is build with extensibility in mind, so it is
easy to create your custom form fields, or your complete views.

### Core technologies

FireCMS is based on this great technologies:

- Typescript
- Firebase
- React + React Router
- Material UI
- Formik + Yup

:::important

Note that this is a full application, with routing enabled and not a simple
component.

:::

## Use

FireCMS is a purely a React app that uses your Firebase project as a backend, so
you do not need a specific backend to make it run. Just build your project
following the installation instructions and deploy it in the way you prefer. A
very easy way is using Firebase Hosting.

## Firebase requirements

You need to enable the Firestore database in your Firebase project. If you have
enabled authentication in the CMS config you need to enable Google
authentication in your project.

Also, if you are using storage fields in your string properties, you need to
enable Firebase Storage.

### Deployment to Firebase hosting

If you are deploying this project to firebase hosting, and the app it properly
linked to it, you can omit the `firebaseConfig` specification, since it gets
picked up automatically.


#### Real time support

Every view in the CMS has real time data support. This makes it suitable for
displaying data that needs to be always updated.

**Forms** also support this feature, any modified value in the database will be
updated in any currently open form view, as long as it has not been touched by
the user. This makes it suitable for advanced cases where you trigger a Cloud
Function after saving an entity that modifies some values, and you want to get
real time updates.
