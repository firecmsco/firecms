---
id: firebase_setup
title: Firebase setup
sidebar_label: Firebase setup
---

In order to run **FireCMS**, you need to create a Firebase project first, with
some requirements:

- You need to enable **Firestore** in it.

- In the project settings, you need to create a **Web app** within your
  project, from which you can get your Firebase config

![firebase_setup](../static/img/firebase_setup_app.png)


:::tip

Note that you can also link your new webapp to **Firebase Hosting** which will
allow you to deploy it with very little effort. You can also create the
Firebase Hosting site at a later stage and link it to your webapp.

:::

- You will most likely want to enable authentication in order to pass the login
screen

![firebase_setup](../static/img/firebase_setup_auth.png)
