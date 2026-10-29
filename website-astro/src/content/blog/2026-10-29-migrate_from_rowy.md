---
slug: migrate_from_rowy
title: "How to Migrate from Rowy to FireCMS: Self-Hosted and Cloud"
seoTitle: "How to Migrate from Rowy to FireCMS"
description: "A step-by-step guide to moving from Rowy, open source or Rowy Cloud, to FireCMS Community, PRO or Cloud. Your data stays in Firestore. A CLI command converts your Rowy tables into FireCMS collections."
pubDate: 2026-10-29
authors: marian
---

Rowy was one of the first tools that made Firestore feel like a spreadsheet. A lot of teams still run their
back office on it. If you are one of them, you have probably noticed that it has stopped moving.

As of October 2026:

- The last commit to the Rowy app was in **November 2024**. The last release, v3.0.0, came out in
  **October 2023**, under the title "Rowy's biggest release yet + Introducing BuildShip".
- The repository now lives under the BuildShip organization on GitHub (`buildship-ai/rowy`).
- Rowy Run, the backend Rowy deploys into your project, still gets occasional maintenance commits.
  The most recent one, in September 2026, pinned dependencies "to prevent breakage".

Rowy is not shut down. But it is not where its team is putting its effort, and that is a risk for the tool
your operations team uses every day.

This guide covers every combination: from **self-hosted Rowy** or **Rowy Cloud**, to **FireCMS Community**,
**FireCMS PRO** or **FireCMS Cloud**. We also built a command that does the tedious part for you:

```bash
npx firecms migrate rowy --project=your-project-id
```

It reads your Rowy tables and writes FireCMS collections, plus a report of everything that needs a human.

## The good news: your data does not move

Rowy and FireCMS work the same way. Both are an admin UI on top of **your own** Firebase project. Neither keeps
a copy of your data.

So the documents in Firestore, the files in Cloud Storage, your Firebase Auth users and your security rules
all stay where they are. Nothing gets exported, imported or re-uploaded.

What you are replacing is everything Rowy added on top:

| Rowy piece | Where it lives | What replaces it |
|---|---|---|
| Table and column settings | Firestore, under `_rowy_` | FireCMS collections (code or schema editor) |
| The Rowy UI | rowy.app, or your own hosting | FireCMS, self-hosted or Cloud |
| One Cloud Function per table (`R-<table>`) | Your project | Your own Cloud Functions |
| Rowy Run (`rowy-backend`) | Cloud Run, your project | Callable functions, FireCMS entity actions |
| Webhooks (`rowy-hooks`) | Cloud Run, your project | HTTPS Cloud Functions |
| Roles | Firebase Auth custom claims (`roles`) | FireCMS roles, or keep the claims |
| `rowy-service` service account | Your project, key held by Rowy | Nothing. Delete it. (Rowy Cloud only.) |

There is one detail that makes this migration much safer than it sounds. **The `R-*` functions run on their own.**
They are Firestore triggers deployed in your project. They do not need the Rowy UI. They fire on every write,
including writes made from FireCMS. So you can switch the UI first and port the backend logic afterwards,
one function at a time.

## Self-hosted Rowy vs Rowy Cloud

The migration is almost the same for both. The differences are in the cleanup:

| | Self-hosted Rowy | Rowy Cloud (rowy.app) |
|---|---|---|
| Rowy UI | You host it | Rowy hosts it |
| Rowy Run, `R-*` functions, `rowy-hooks` | In your project | In your project |
| A service account key held by a third party | No | Yes: `rowy-service`, with about 20 admin roles |
| Subscription to cancel | No | Yes, if you are on Pro, Team or Business |

If you are on Rowy Cloud, read the last section carefully. During setup, Rowy asked you to create a service account
called `rowy-service`. You gave it roles like Project IAM Admin, Service Account Admin, Secret Manager Admin
and Firebase Admin, then uploaded its key to Rowy. That key still works. Deleting it should be part of your plan.

## Pick your FireCMS flavour

FireCMS comes in three versions, and they all read the same collection config:

| | Community | PRO | Cloud |
|---|---|---|---|
| Price | Free, MIT license | €99 / month for the first project, €49 for each extra one. Unlimited users. | €9.99 per user / month, after a 1-month free trial |
| Hosting | You | You | FireCMS |
| Users and roles UI | No: you write an authenticator and permissions in code | Yes | Yes |
| Schema editor UI | No | Yes | Yes |
| CSV and JSON import / export | No | Yes | Yes |
| Change history | No | Yes | Yes |
| Your own React code | Yes | Yes | Yes, uploaded with `npm run deploy` |

A rough guide:

- **Coming from self-hosted Rowy**, and you like owning the deployment: FireCMS **Community**, or **PRO** if
  non-developers manage users and columns.
- **Coming from Rowy Cloud**, and you want nothing to host: **FireCMS Cloud**.

The rest of this guide works for all three. Where a step differs, it says so.

## How Rowy concepts map to FireCMS

| Rowy | FireCMS |
|---|---|
| Table | Collection |
| Column | Property |
| Section | `group` on the collection |
| Sub-table | Subcollection |
| Collection group table | `collectionGroup: true` |
| Table roles | Role permissions per collection (PRO, Cloud), or a `permissions` builder (Community) |
| Read-only table | `permissions: { read: true, create: false, edit: false, delete: false }` |
| Static default value | `defaultValue` |
| Dynamic default value | `onPreSave` callback, or a Cloud Function |
| Derivative column | A Cloud Function, or `onPreSave` if only FireCMS writes the inputs |
| Formula column | `additionalFields` |
| Action column | `entityActions` that call a callable Cloud Function |
| Extensions | Cloud Functions or Firebase Extensions |
| History snapshot extension | `history: true` (PRO, Cloud) |
| Webhooks | HTTPS Cloud Functions |
| Side drawer | Side panel form |
| Saved filters and sorts | `initialFilter`, `initialSort` |
| Algolia or Meilisearch search | Local text search (Cloud), the [Typesense extension](/blog/full_text_search_firestore_typesense), or a `textSearchController` |

## Step 1: Back up

Nothing in this guide deletes data until the last section, but take a backup anyway. A full Firestore export:

```bash
gcloud firestore export gs://your-backup-bucket/before-rowy-migration --project=your-project-id
```

This also captures `_rowy_`, which holds every table setting and every script Rowy ran for you.

## Step 2: Convert your tables

Rowy stores its whole configuration in your Firestore: the list of tables in `_rowy_/settings`, and each table's
columns in `_rowy_/settings/schema/{tableId}`. Converting that by hand is slow and full of chances for typos.
So the FireCMS CLI does it:

```bash
gcloud auth login
npx firecms migrate rowy --project=your-project-id --target=cloud
```

Use `--target=self-hosted` (the default) for Community and PRO. The only difference is the import line in the
generated files.

What the command does and does not do:

- It **reads** Rowy's configuration: `_rowy_/settings` and the schema documents under it.
- It does **not** read your documents, and it **writes nothing** to your project.
- It signs in with your own `gcloud` account, so you don't need to create a service account key. The account needs
  read access to Firestore, for example the Cloud Datastore Viewer role.
- It **never copies webhook verification secrets**. The report just tells you which webhooks had one.

It writes a `rowy-migration` folder:

```
rowy-migration/
├── MIGRATION_REPORT.md      what each column became, and what is left to do
├── collections/
│   ├── index.ts             export const rowyCollections = [...]
│   ├── products.ts
│   └── orders.ts
└── rowy-scripts/
    └── products/
        ├── slug.derivative.ts
        ├── publish.action.ts
        └── extension-Search_index.ts
```

A generated collection looks like the ones you would write by hand:

```ts
// Generated by `firecms migrate rowy` from the Rowy table "Products" (products).
import { buildCollection } from "@firecms/core";

export const productsCollection = buildCollection({
    id: "products",
    name: "Products",
    path: "products",
    group: "Shop",
    initialSort: ["title", "desc"],
    includeJsonView: true,
    properties: {
        title: {
            dataType: "string",
            name: "Title",
            validation: { required: true }
        },
        status: {
            dataType: "string",
            name: "Status",
            enumValues: [
                { id: "live", label: "live" },
                { id: "draft", label: "draft" }
            ]
        },
        slug: { dataType: "string", name: "Slug", readOnly: true }
    },
    // ...
});
```

A few things it does on purpose:

- **It never guesses.** When Rowy did not record something, such as which collection a Reference column
  points to, the property is left read-only and the report tells you what to set.
- **It keeps Rowy's audit fields alive.** Rowy wrote `_createdBy` and `_updatedBy` on every edit. If any of
  your code reads them, it would quietly go stale. The generated `onPreSave` callback keeps writing them. Delete it
  if nothing needs them.
- **It turns on the JSON tab** (`includeJsonView`), so editors can see every field of a document, including
  the ones without a property.
- **It flags hardcoded credentials.** It copies every derivative, action, extension and webhook script into
  `rowy-scripts/` so you can port them. If a line looks like a pasted key or password, the report names the
  file and line, without repeating the value. Treat any key it finds as exposed and rotate it.

No Rowy access, or want to try it first? `--input` reads the same configuration from a JSON file, and
`--tables=products,orders` converts only the tables you name.

## Step 3a: Self-hosted (Community or PRO)

Create the app:

```bash
npx firecms init --community   # MIT
# or
npx firecms init --pro         # user management, schema editor, import/export, history
```

Copy `rowy-migration/collections` into `src/collections/rowy`, and add the collections to the array the template
passes to `useBuildNavigationController`:

```ts
import { rowyCollections } from "./collections/rowy";

const collections = [
    ...rowyCollections
    // your other collections
];
```

Run `npm run dev` and sign in with a user from your Firebase project.

**Who can get in.** With PRO, the user management plugin handles this: recreate your roles and add your users
(see Step 5). With Community, you write an authenticator. Rowy already gave your team a `roles` custom claim, so you
can reuse it:

```ts
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

export const rowyRolesAuthenticator: Authenticator<FirebaseUserWrapper> = async ({ user, authController }) => {
    if (!user?.firebaseUser) return false;
    const { claims } = await user.firebaseUser.getIdTokenResult();
    const roles = Array.isArray(claims.roles) ? claims.roles as string[] : [];
    authController.setExtra({ roles });
    return roles.length > 0;
};
```

Then use `authController.extra.roles` in each collection's `permissions` builder.

**Deploy** wherever you host static sites. Firebase Hosting is the simplest, see
[Self-Hosted Deployment](/docs/self/deployment).

## Step 3b: FireCMS Cloud

1. Go to [app.firecms.co](https://app.firecms.co), create a project and link your **existing** Firebase project.
2. Create the code project. When asked, pick the project you just created:

   ```bash
   npx firecms init --cloud
   ```

3. Copy `rowy-migration/collections` into `src/collections/rowy` and add them in `src/index.tsx`:

   ```ts
   import { FireCMSAppConfig } from "@firecms/cloud";
   import { rowyCollections } from "./collections/rowy";

   const appConfig: FireCMSAppConfig = {
       version: "2",
       collections: [...rowyCollections]
   };

   export default appConfig;
   ```

4. Run `npm run dev` to check it locally. Then `npm run deploy` publishes it to your Cloud project.

**The no-code route.** If you would rather not touch code, skip the CLI. In FireCMS Cloud, create collections
from the schema editor and map them to your existing Firestore collections. "Auto-detect collections" scans
your database and proposes a schema. You lose the things only Rowy's config knew: column order, option lists,
validation, and which columns were derivatives. In exchange you never open a terminal. You can also mix both:
code for your complex tables, the editor for the simple ones.

## Step 4: Column types, one by one

Most columns map directly. Here is the full list, and what the CLI does with each.

| Rowy column | FireCMS property | Notes |
|---|---|---|
| Short text, Phone | `string` | |
| Long text, Code | `string`, `multiline: true` | |
| Rich text | `string`, `multiline: true` | Rowy stored HTML. `markdown: true` would rewrite it as markdown on save, so only use it if your app reads markdown. |
| Markdown | `string`, `markdown: true` | |
| Email / URL | `string`, `email: true` / `url: true` | |
| Single select | `string` with `enumValues` | Rowy's "free text" option allowed values outside the list. FireCMS marks those as invalid. |
| Multi select | `array` of `string` with `enumValues` | |
| Checkbox | `boolean` | |
| Number, Rating, Slider | `number` | Rating and slider ranges become `validation.min` / `max`. |
| Percentage | `number` | Stored as a fraction: 0.25 is 25%. |
| Date / Date & time | `date`, `mode: "date"` / `"date_time"` | |
| Duration | `map` with `start` and `end` dates | |
| GeoPoint | `geopoint` | |
| JSON | `map`, `keyValue: true` | |
| Color | `map` (read-only) | Rowy stored `{ hex, rgb, hsv }`. Editing `hex` alone would leave the others stale. |
| Image / File | read-only list | See "Files and images" below. |
| Reference | `reference` | Set `path` to the target collection to make it editable. |
| Connect table / Connect service | read-only list of `{ docPath, snapshot }` | Convert to `reference` to edit links. See below. |
| Sub-table | subcollection | |
| Array sub-table | `array` of `map` | |
| Derivative | the type it displayed as, read-only | Port its script (Step 5). |
| Formula | not stored | Recreate with `additionalFields`. |
| Action | read-only `map` with the last `status` | Recreate as an entity action. |
| Status | read-only `string` with `enumValues` | When its labels are based on text values. |
| User, Created by, Updated by | read-only `map` | FireCMS can pick users with `userSelect`, which stores only the user ID. |
| Created at, Updated at | read-only `date` inside `_createdBy` / `_updatedBy` | That is where Rowy stored them. |
| ID | not needed | FireCMS always shows the document ID. |

### Files and images

Rowy stored each file field as a list of objects:

```json
[{ "downloadURL": "https://...", "ref": "products/abc/photos/x1-front.jpg", "name": "front.jpg", "type": "image/jpeg", "lastModifiedTS": 1700000000000 }]
```

FireCMS stores plain strings: a storage path, or a URL if you set `storeUrl: true`. Until you convert the values,
the generated collection shows these fields read-only, so nothing breaks.

To make them uploadable, replace each list with its `ref` values. This script does it with the Admin SDK. Without
`--apply` it only counts what would change:

```ts
// convert-rowy-files.mts
// GOOGLE_CLOUD_PROJECT=your-project-id npx tsx convert-rowy-files.mts products photos [--apply]
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const [collectionPath, field, flag] = process.argv.slice(2);
const apply = flag === "--apply";

initializeApp();
const db = getFirestore();
const snapshot = await db.collection(collectionPath).select(field).get();
const writer = db.bulkWriter();

let changed = 0;
for (const doc of snapshot.docs) {
    const value = doc.get(field);
    if (!Array.isArray(value) || !value.some(item => item && typeof item === "object")) continue;
    const paths = value.map(item => typeof item === "string" ? item : item?.ref).filter(Boolean);
    changed++;
    if (apply) writer.update(doc.ref, { [field]: paths });
}
await writer.close();
console.log(`${changed} documents ${apply ? "updated" : "would change"}.`);
```

Then switch the property to the `storage` version the CLI wrote in a comment above it. It keeps Rowy's folder
layout, so new uploads land next to the old ones:

```ts
photos: {
    dataType: "array",
    name: "Photos",
    of: {
        dataType: "string",
        storage: {
            storagePath: "{path}/{entityId}/{propertyKey}",
            fileName: "{rand}-{file}",
            acceptedFiles: ["image/*"]
        }
    }
}
```

The files themselves stay where they are. **Check your own apps first.** If they read `photo.downloadURL`,
update them before you run `--apply`. Or map `item.downloadURL` instead of `item.ref` and set `storeUrl: true`,
so the field holds URLs.

### Connected documents

Rowy's Connect table column stored a **copy** of each linked document, as `{ docPath, snapshot }`, and the table's
`R-*` function kept those copies in sync. FireCMS links documents with real Firestore references instead.

If your apps only use `docPath`, convert each value with the same pattern as above, using
`db.doc(item.docPath)`, and use a `reference` property (or an `array` of them). If your apps read fields from
`snapshot`, keep the column read-only, or move the sync into your own Cloud Function before you delete `R-*`.

## Step 5: Users, roles and security rules

This is the step people get wrong, so take it slowly.

**How Rowy did it.** Rowy put a `roles` array in each user's Firebase Auth custom claims, for example
`{ roles: ["ADMIN"] }`. Your Firestore rules check it with a helper Rowy generated:

```
function hasAnyRole(roles) {
  return request.auth != null && request.auth.token.roles.hasAny(roles);
}
```

Table visibility in Rowy was only a UI setting. Your **rules** are what actually protect the data.

**Keep the claims and the rules for now.** They work no matter which UI sits on top, so your data stays protected
while you switch. With Community and the authenticator from Step 3a, everyone who had a Rowy role can sign in
straight away. With PRO and Cloud, people get in once you add them as users.

**Add your roles in FireCMS.** The report lists every Rowy role and the tables it could see. In PRO or Cloud,
recreate them in the Roles screen: `ADMIN` and `OWNER` become admins, and the others get permissions on the
collections they could see. In Community, read the claim in your authenticator, as shown in Step 3a.

**New users need the claim too**, if your rules require it. Rowy Run used to set it. Now it's a few lines with
the Admin SDK:

```ts
// set-roles.mts
// GOOGLE_CLOUD_PROJECT=your-project-id npx tsx set-roles.mts editor@example.com EDITOR
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp();
const [email, ...roles] = process.argv.slice(2);
const user = await getAuth().getUserByEmail(email);
await getAuth().setCustomUserClaims(user.uid, { ...user.customClaims, roles });
console.log(`${email} now has: ${roles.join(", ")}. They need to sign in again.`);
```

To run Admin SDK scripts like these and the file conversion from your machine, sign in once with
`gcloud auth application-default login` and run `gcloud auth application-default set-quota-project your-project-id`.
You won't need a key file.

If you move to FireCMS PRO, you can later switch your rules to check FireCMS users instead. See
[Firestore rules for PRO](/docs/pro/firestore_rules). FireCMS Cloud keeps its users outside your project, so with
Cloud, keep claims-based rules.

## Step 6: Port the backend logic

Everything in this step can wait. The `R-*` functions keep running until you delete them. Port one piece at a
time, deploy it, check it, then turn off the Rowy version.

### Derivatives

Rowy ran each derivative inside the table's `R-*` function, on every write. The CLI copied each script to
`rowy-scripts/<table>/<column>.derivative.ts`. The direct replacement is a Firestore trigger:

```ts
import { onDocumentWritten } from "firebase-functions/v2/firestore";

export const productSlug = onDocumentWritten("products/{id}", async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const row = after.data()!;
    const slug = String(row.title ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    // Writing triggers the function again. Stop when there is nothing to change.
    if (row.slug === slug) return;
    await after.ref.update({ slug });
});
```

Rowy only re-ran a derivative when one of its listener fields changed. Compare
`event.data.before.data()` with the new data if you need the same behaviour.

If the inputs are only ever edited in FireCMS, a callback is simpler and needs no deploy:

```ts
callbacks: {
    onPreSave: ({ values }) => ({
        ...values,
        slug: String(values.title ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
    })
}
```

### Actions

Action columns ran their script on Rowy Run. Move the script into a callable Cloud Function, then add an entity
action that calls it. The action appears in the collection's row menu and in the form:

```ts
import { getFunctions, httpsCallable } from "firebase/functions";

entityActions: [
    {
        key: "publish",
        name: "Publish",
        onClick: async ({ entity, context }) => {
            await httpsCallable(getFunctions(), "publishProduct")({ id: entity?.id });
            context.snackbarController.open({ type: "success", message: "Published" });
        }
    }
]
```

If your action already called one of your own callable functions, the report names it. Only the button needs
recreating.

### Formulas

Formulas ran in the browser and were never stored. Use `additionalFields`:

```ts
additionalFields: [
    {
        key: "margin",
        name: "Margin",
        dependencies: ["price", "cost"],
        value: ({ entity }) => Number(entity.values.price ?? 0) - Number(entity.values.cost ?? 0)
    }
]
```

### Default values

Static defaults become `defaultValue`, and the CLI does it for you. Dynamic defaults ran in `R-*` when a row was
created. Use `onPreSave` and check `status === "new"`, or a Cloud Function if other apps also create documents.

### Extensions

| Rowy extension | Replacement |
|---|---|
| History snapshot | `history: true` on the collection (PRO, Cloud) |
| Algolia index | The official Algolia Firebase Extension |
| BigQuery index | The official "Stream Firestore to BigQuery" extension |
| SendGrid email | The official "Trigger Email from Firestore" extension |
| Meilisearch, Slack, Twilio, push notification, API call, task, doc sync | A Cloud Function with a Firestore trigger |

Keep secrets in Secret Manager and read them with `defineSecret`. Never put them in the function's code. Rowy stored
its extension secrets in Secret Manager too, so the secrets you need are probably already there.

### Webhooks

Rowy's webhooks were served by the `rowy-hooks` Cloud Run service, at URLs like
`https://rowy-hooks-....run.app/wh/<collection>/<endpoint>`. The report lists each one with its current URL.
For each:

1. Port the parser from `rowy-scripts/` into an HTTPS function (`onRequest`).
2. Create a new verification secret in Secret Manager. The CLI deliberately did not copy the old one.
3. Change the URL in the sending service (Stripe, Typeform, SendGrid...) and send a test event.

## Step 7: Run both, then switch

Because both tools work on the same data, you can run them side by side for as long as you like. FireCMS saves with
a merge, so it never deletes fields it doesn't know about. Columns you have not converted yet are left untouched.

A sensible order:

1. Give a few people FireCMS, and keep Rowy for everyone else.
2. Fix what they run into: usually a missing reference `path`, or a select option.
3. Move everyone. Make Rowy read-only, or stop sharing its URL.
4. Port the backend logic (Step 6) at your own pace.

## Step 8: Decommission Rowy

Do this last, and in this order. Each step only removes something you have already replaced.

1. **Delete the `R-*` functions** once you have ported their derivatives, extensions, default values and
   Connect table syncing. They are 1st gen functions, in your Rowy Run region:

   ```bash
   gcloud functions delete R-products --region=us-central1 --project=your-project-id
   ```

2. **Delete the webhook service**, once every sender points at your new functions:

   ```bash
   gcloud run services delete rowy-hooks --region=us-central1 --project=your-project-id
   ```

3. **Delete Rowy Run**, once your actions and role management no longer depend on it:

   ```bash
   gcloud run services delete rowy-backend --region=us-central1 --project=your-project-id
   ```

   The container images for both services stay in your project's container registry. Delete them too if you want
   to reclaim the space.

4. **Rowy Cloud only: revoke Rowy's access.** Delete the project in your rowy.app workspace settings and cancel the
   subscription. Then delete the `rowy-service` service account. This revokes the key you uploaded to Rowy, along
   with all its admin roles:

   ```bash
   gcloud iam service-accounts delete rowy-service@your-project-id.iam.gserviceaccount.com --project=your-project-id
   ```

   **Self-hosted Rowy:** take down wherever you hosted the Rowy app.

5. **Review Secret Manager.** Delete the secrets that only Rowy used.

6. **Clean up your security rules.** Remove the `_rowy_` rules. Keep `hasAnyRole` and the `roles` claims for as long
   as your rules use them.

7. **Delete `_rowy_`.** Keep your backup from Step 1. This collection holds your old scripts, and
   `_rowy_/userManagement/users` holds a copy of each Rowy user's name and email. Don't keep personal data you no longer
   need:

   ```bash
   firebase firestore:delete _rowy_ --recursive --project=your-project-id
   ```

## What you gain, and what you'll miss

What you'll miss is mostly the spreadsheet feel. Formulas live in code now, and so do derivatives. You give up the
"write a function in the browser and click deploy" workflow, in exchange for Cloud Functions you deploy, review and
version yourself.

What you gain:

- **Code you own.** Collections are TypeScript in your repository, reviewed in pull requests, the same in every
  environment. The schema editor is there for the people who prefer it.
- **A real form for every document,** with validation, conditional fields, custom React fields, and card and kanban
  views.
- **Permissions per role and per collection,** with separate read, create, edit and delete.
- **Change history** for each document, with who changed what and a way to revert (PRO, Cloud).
- **A tool under active development,** with its code on GitHub.

## FAQ

**Do I have to move my data?**
No. FireCMS reads and writes the same Firestore documents Rowy did.

**Can I keep using Rowy while I migrate?**
Yes. Both can run at the same time on the same data, and the `R-*` functions keep firing on writes from FireCMS.

**Will FireCMS delete fields it doesn't have a property for?**
No. Saves are merged into the document, so other fields are left alone. You can see them in the JSON tab.

**Does `firecms migrate rowy` change anything in my project?**
No. It only reads `_rowy_`. Everything it writes goes into a local folder.

**I use BuildShip with Rowy's trigger extension. What now?**
Keep your BuildShip workflows. Call them from a Cloud Function with a Firestore trigger, or from a FireCMS
callback or entity action.

**What if my table settings use a column type the CLI doesn't know?**
The column is left out and listed in the report. Its data stays in the document, and the JSON tab shows it.

If you get stuck, [tell us on Discord](https://discord.gg/fxy7xsQm3m) or open an issue on
[GitHub](https://github.com/firecmsco/firecms). We'd like to hear which parts of your Rowy setup were hardest
to move.
