---
id: firebase_setup
title: Firebase setup
sidebar_label: Firebase setup
---

In order to run **FireCMS**, you need to create a Firebase project first, with
some requirements:

### Firestore
You need to enable **Firestore** in it.

### Web app
In the project settings, you need to create a **Web app** within your
project, from which you can get your Firebase config as a Javascript object.
That is the object that you need to pass to the CMS.

![firebase_setup](../static/img/firebase_setup_app.png)

:::tip

Note that you can also link your new webapp to **Firebase Hosting** which will
allow you to deploy it with very little effort. You can also create the
Firebase Hosting site at a later stage and link it to your webapp.

:::

### Authentication
You will most likely want to enable authentication in order to pass the login
screen

![firebase_setup](../static/img/firebase_setup_auth.png)


### Storage

In case you want to use the different storage fields provided by the CMS, you
need to enable **Firebase Storage**. The default bucket will be used to
save your stored files.
