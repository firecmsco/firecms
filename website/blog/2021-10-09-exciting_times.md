---
slug: exciting_times_1_0_0
title: Release of version 1.0.0
author: Francesco Gatti
image: /img/francesco_avatar.jpg
author_url: https://www.linkedin.com/in/fgatti675
author_image_url: https://avatars.githubusercontent.com/u/5120271?v=4
---


![Dark mode](../static/img/dark_mode.png)

> Exciting times for our project!

After more than 60 releases, and numerous refinements of the internal components
and APIs, we are ready to start the beta release of version 1.0.0 💃

We now consider that the code and the UX and UI are mature enough
to create a beta release (though we have multiple instances of previous versions
already in production!).

In the last months we've been focused on improving the CMS quality by
doing a lot of internal restructuring that is also going to affect the public
facing APIs.

## A bit of background

We started building FireCMS out of necessity. We were working on several
projects based on Firebase and in most of them we needed to develop some kind of
backend admin panel/CMS. We took some of those tools we had built, and merged
them into a single generic project that would support any database structure and
data type. We needed to make sure that we would need to be able to customize
many aspects of each implementation based on the necessity.

The outcome was a very good starting point to what would become FireCMS after
many iterations and feature updates. One of the consequences of this approach
was that the code was tightly coupled to Firebase, and you could find imports to
Firebase code in most layers of the code.

## The influence of Firebase

The original coupling to Firebase and specially the data structure of Firestore
has influenced many aspects of this project. The way we create entities based on
documents and collections and subcollections mimics the Firestore data
structure. What seemed like a limitation has turned out to be an
opportunity to think of a **great UI**.

At Camberi we have a special passion for **user experience** and believe that
internal admin tools don't always receive the love they deserve.

In this time, we have developed some high quality components such as the
spreadsheet views of collections, or the side panel to edit entities and nested
subcollections.

## Where we are going

In the last year, we have seen developers integrate FireCMS in ways we had never
imagined! We have tweaked the APIs to try to accommodate those requirements, but
we have come to the conclusion that a bigger change was needed.

The result is a big rework of the internal APIs and components that improves
re-usability and customisation.

We have also added a lot of minor performance tweaks as well as design tweaks
and improvements, including a very awesome new **dark mode**!

If you are using `FirebaseCMSApp` (previously `CMSApp`), so FireCMS as a
standalone app, you will need to update some APIs (see the [Migrating from alpha versions](../docs/migrating_from_alpha_versions)).

But, but, but...
If you need more customisation you can now completely
override `FirebaseCMSApp` and reuse all its internal components. This means you now
have control of the MUI theme (adapted to V5), the CMS routes (adapted to React
Router 6), or how you display the different parts, such as the side dialogs, or
add your own.

You are now free to integrate the new `FireCMS` component and reuse all the
internal components, combine them with your own, build your own custom themes
or custom backend implementations.

## Separation of concerns

In the process of having a cleaner code, all the code related to Firebase has
been isolated into 3 components, one for authentication, one
for the data source and one for storage. These components are abstracted away
behind their respective interfaces. This means you can replace any of those
parts with your custom implementation!

We have three new types that abstract away the services provided by Firebase:
- [`AuthDelegate`](../docs/api/interfaces/datasource), in charge of handling
  the auth operation such as login or sign out, and build the logged-in user.
- [`DataSource`](../docs/api/interfaces/datasource), in charge of handling data
  operation (fetch, listen, save, delete).
- [`StorageSource`](../docs/api/interfaces/storagesource), in charge of dealing
  with file storage operations.

We provide implementation for using Firebase Auth, Firestore and Firebase Storage,
assigned by default if you use `FirebaseCMSApp`.

This means that you are now able to use FireCMS with any backend, auth or storage
solution. If you want to go this way, you can check an [example implementation](../docs/custom_cms_app)
of FireCMS that uses the internal components instead of `FirebaseCMSApp`

:::note How did it go?
If you have been using FireCMS with a custom backend, we would love to hear your feedback
either in https://www.reddit.com/r/firecms/ or directly at hello@camberi.com 😊
:::

## Code quality

We have done a huge internal refactor that affects pretty much every part of the
CMS. We have now a much better separation of the internal packages. There is
also a package named `firebase_app` which encapsulates an implementation of
`FireCMS` that uses the Firebase services as backend.

All the code referring to Firebase can be found only in this internal package,
and nowhere else. This means the core of FireCMS has been completely isolated
from Firebase and is now much more maintainable and extendable.

We have got a lot of PRs and support from out users and would love to foster
that participation going forward. A cleaner code will help everyone involved
and allow for more and better features!



