---
slug: docs/self/telemetry
title: Telemetry and the license check
sidebar_label: Telemetry
description: The one request a self-hosted FireCMS app sends to FireCMS, what it contains, what we store and why, and how to turn it off in Community.
---

A self-hosted FireCMS app reads and writes your data from the browser, through the Firebase SDK or your own backend. It sends one request to FireCMS: the access log, which is also the PRO license check. This page lists exactly what that request contains and what we keep.

## When it is sent

Once per signed-in user each time the app loads: when a user signs in, or when the app opens with a user already signed in, the browser sends a `POST` request to `https://api.firecms.co/access_log`. It is sent from local development too.

## What the request contains

- **`Authorization` header**: the signed-in user's ID token from your auth provider (for example Firebase Authentication).
- **`Referer` header**: added by the browser; the URL of the page the app runs on.
- **Body**:
  - `apiKey`: your PRO license key, if you set one
  - `email`: the signed-in user's email address
  - `datasource`: the key of the data source in use, for example `firestore`
  - `plugins`: the keys of the plugins you configured, for example `["collection_editor", "user_management"]`

The request contains no database credentials, no documents or other Firestore content, and no collection schemas.

## What we store

Our server reads the Firebase project ID from the ID token and stores one entry per request, with:

- the Firebase project ID and, if a license key was sent, the license ID
- the user's uid and email address
- the decoded ID token claims. These include the uid and email, and the display name, photo URL and sign-in provider when your auth provider sets them.
- the referer URL
- the data source key and the plugin keys
- the result of the license check (whether PRO features were paused)
- a timestamp

Entries are stored in our Google Cloud project, in Firestore with a copy in BigQuery for usage analysis. The request body, without the license key, is also written to our server logs.

## Why

- **License validation.** For a project that uses PRO plugins, the response tells the app whether they run or pause.
- **The trial clock.** A project's [30-day production trial](/docs/pro/licensing#30-day-free-trial) starts with its first entry from a deployed app that uses PRO plugins.
- **Usage counts.** How many projects and users run FireCMS Community and PRO, and which plugins they use.

## Emails

When a deployed app uses PRO plugins, we also use the email address in the entry to write to that user about PRO: a welcome email the first time the project runs PRO, a follow-up about 14 days later, and a notice if the license check pauses PRO features. None of these is sent twice to the same address for the same project.

## Retention

Entries are currently kept without a fixed deletion date. Email [hello@firecms.co](mailto:hello@firecms.co) to have your project's entries deleted.

## Turning it off

In an app with no `apiKey` and no PRO plugin, pass `telemetry={false}` to `FireCMS` and the request is not sent at all:

```tsx
<FireCMS
    telemetry={false}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}>
    {/* ... */}
</FireCMS>
```

With an `apiKey` set, or any PRO plugin mounted (collection editor, user management, import/export, entity history, data enhancement, DataTalk), the request is always sent: it is the license check, and it starts the trial.

## Other requests to FireCMS

This page covers the access log only. The optional AI features (data enhancement, DataTalk, and AI collection generation in the collection editor) send the fields and prompts you use them on to `api.firecms.co`. They only run when you add them to your app.
