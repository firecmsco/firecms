---
slug: docs/pro/licensing
title: Licensing
description: FireCMS PRO pricing, the 30-day production trial, what pauses without a license, and how to set your license key.
---

:::tip
Do you have any questions, or need a custom license?
Please [contact us via email](mailto:hello@firecms.co),
or [schedule a call](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true).
:::

## Price

FireCMS PRO costs **€99 / month for the first project** and **€49 / month for each additional project** on the same license, plus VAT.

| | Monthly | Yearly |
|---|---|---|
| First project | €99 ($119) | €990 ($1,190) |
| Each additional project | €49 ($59) | €490 ($590) |

- **The unit is a Firebase project.** Every project linked to a license counts the same. There is no difference between development, staging and production: an app with separate dev, staging and prod Firebase projects is three projects.
- **Seats are unlimited.** Add as many users as you need to every project.
- **Keep all your projects on one license.** The €49 rate applies to projects on the same license, so one license is cheaper than several. Prod and staging on one license cost €99 + €49 = €148 / month. Five client projects on one license cost €99 + 4 × €49 = €295 / month; on five separate licenses they would cost €495.

## 30-day free trial

PRO is free for **30 days in production**. You don't need a card or a license key to start.

The trial of a Firebase project starts the first time a deployed app, meaning anything not served from `localhost`, `127.0.0.1` or `[::1]`, runs a PRO plugin with that project. Local development never needs a license.

## What happens when the trial ends

If a project has no valid license when its trial ends, or when its license lapses, these PRO features pause:

- the collection (schema) editor
- import and export
- entity history
- data enhancement (AI autofill)
- DataTalk

The app itself keeps working. Sign-in, your data, collections defined in code and collections saved with the schema editor all keep loading and can still be edited. User management keeps handling sign-in and roles, but its Users and Roles screens show a notice that they are paused. A banner in the app links to the page where you can get a license. Once the project is on an active license, the paused features come back the next time the app loads.

A license covers as many projects in production as it pays for. If more of its projects run in production, the ones that went live first keep PRO, and PRO pauses on the others, as above, until the license pays for them. Local development never counts.

## Plugins that need a license

| Plugin | Package |
|---|---|
| Collection editor | `@firecms/collection_editor` |
| User management | `@firecms/user_management` |
| Import and export | `@firecms/data_import`, `@firecms/data_export`, `@firecms/data_import_export` |
| Entity history | `@firecms/entity_history` |
| Data enhancement | `@firecms/data_enhancement` |
| DataTalk | `@firecms/datatalk` |

The media manager, the Firebase admin plugin and your own plugins don't need a license. An app that uses none of the plugins above is FireCMS Community, free under the MIT license.

## Get a license and set the key

1. Go to [app.firecms.co/subscriptions](https://app.firecms.co/subscriptions?intent=pro) and sign in.
2. Create a PRO license and add the ID of every Firebase project it should cover. You find a project's ID in the Firebase console, under **Project settings**.
3. Copy the license key and pass it to the `FireCMS` component as `apiKey`:

```tsx
<FireCMS
    apiKey={import.meta.env.VITE_FIRECMS_API_KEY}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={plugins}>
    {/* ... */}
</FireCMS>
```

If you started from the PRO template (`npx create-firecms-app --pro`), set `VITE_FIRECMS_API_KEY` in the `.env` file; the template already passes it to `FireCMS`.

When you add a new project, such as a staging environment or a new client, add its ID to the same license rather than creating a new one, so it is billed at the €49 rate.

## Telemetry

The license check is a single request from the browser to `api.firecms.co` when a signed-in user opens the app. [Telemetry](/docs/self/telemetry) lists exactly what it sends, what we store and why.
