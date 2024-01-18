---
slug: version_1_is_out
title: Release of version 1.0.0
author: Francesco Gatti
image: /img/avatars/francesco_avatar.jpg
author_url: https://www.linkedin.com/in/fgatti675
author_image_url: https://avatars.githubusercontent.com/u/5120271?v=4
---

![Dark mode](../static/img/dark_mode.png)

> FireCMS 1.0 is ready to ship! 🙌 abd why Firebase makes for an amazing developer
> experince

A few months have passed since we entered the beta period of FireCMS, our
Firestore-based CMS built with developer experience in mind.

We have collected your feedback to add new features and quality of life
improvements, fixed bugs, and merged your PRs (thank you!).

After reaching more than 500 stars on GitHub, and 100 forks, it is a good time
to finally end the beta and release-candidate phases and ship version 1.0.0

## Why Firebase and FireCMS

At Camberi, we have been developing web apps and mobile apps for a long time. We have
used Firebase and Firestore as a backend and database in multiple projects.

Our experience overall has been great!

Firebase offers a very powerful backend out of the box, and allows to kickstart
a project in no time. It provides SDKs for the most relevant platforms, such as web,
iOS or Android (and more) and has some features that make it stand out, like
**real-time data synchronisation** and its **scalability**.

If you need to start a new project and don't want to spend too many resources in
the backend, Firebase is the way to go. But this doesn't mean you can't build complex
apps with it!

If you are coming from a more traditional backend setup you will need to make a 
bit of a mind switch. You can extend the functionality of your backend using functions,
and have triggers when the data in your database gets updated.

Also, you are not forced to connect your apps to Firestore and you can build 
have a REST API or use callable functions to have your backend logic.

And, even if you don't want to use any of the Firebase services, because you
already have your auth and APIs in place, you can set up a Firebase with FireCMS
project just to manage your content.

> We built FireCMS out of necessity.


If you are coming from a SQL background you will need to get used to de-normalising
your data and having limited querying capabilities


## Where we are

For every Firebase project that we developed for a client we needed a way to
manage their content, and provide a backend admin panel. So we built our own!

After more than 2 years
of development, FireCMS has gone from a simple app that would let us produce
some simple CRUD views over collections to a full-blown CMS that includes:

- Detailed CRUD views for collections.
- Super powerful data tables with inline editing, alla AirTable.
- Awesome, performant and beautiful UI.
- Form views with more than 20 different widgets, including advanced ones such
  as:
  - File uploads
  - Reference support for different collections
  - Date time
  - Enumerations
  - ...and many more!
- Possibility to customise your own form fields and how the underlying data is
  rendered.
- Possibility to build fields based on other values.
- Subcollections support.
- Virtualized views for performance.
- Text search support.
- Customisation the CMS based on the logged-in user.

FireCMS offer more customization options than any other alternative, such as
Rowy or Flamelink. It even offers features that are not available in some well
established CMS like WordPress or Strapi, like the inline editing.

## The future

We keep on getting amazed on how you are finding innovative ways to use
FireCMS and we want to make it easier for you to do so.

We are already working on version 2 of FireCMS and are improving on almost every 
aspect of it:
- Forms layouts and performance.
- Internal and external APIS
- Reusability of internal components
- Property builders at any level of your property tree, not just at the root.
- Improved modularity and reusability of components


