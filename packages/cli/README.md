## FireCMS CLI

This CLI tool allows you to create new FireCMS projects and to deploy them to FireCMS Cloud.
**IMPORTANT**: You should not be using this tool directly, but `firecms` instead.

### CLI

You can use the following commands:

```bash
firecms login
```

```bash
firecms init
```

```bash
firecms deploy
```

```bash
firecms migrate rowy --project=your-project-id
```

### Migrating from Rowy

`firecms migrate rowy` reads the table settings Rowy keeps in Firestore under `_rowy_` and writes:

- `collections/`: one FireCMS collection per Rowy table, and an `index.ts` exporting `rowyCollections`
- `rowy-scripts/`: the derivative, action, default value, formula, extension and webhook code Rowy ran, to port
- `MIGRATION_REPORT.md`: what each column became, and what is left to do

It only reads Rowy's configuration. It does not read documents and writes nothing to your project.
It signs in with your gcloud account (`gcloud auth login`), so no service account key is needed.
Webhook verification secrets are never copied.

```bash
firecms migrate rowy --project=your-project-id --target=cloud        # imports from @firecms/cloud
firecms migrate rowy --project=your-project-id --target=self-hosted  # imports from @firecms/core (default)
firecms migrate rowy --input=rowy-config.json                         # offline, from { settings, schemas, groupSchemas }
```

Other options: `--out <folder>` (default `./rowy-migration`), `--tables <id,id>`, `--force`.

### Using different templates

You can initialize a new project using different templates. Please not that these templates can't
be deployed to FireCMS Cloud. For example:

For FireCMS Cloud

```bash
firecms init
```

For FireCMS PRO:

```bash
firecms init --pro
```

For FireCMS with Astro (self-hosted with Astro SSG/SSR and blog support):

```bash
firecms init --astro
```

For FireCMS Community (MIT licensed):

```bash
firecms init --community
```

#### To run locally

For development purposes, you can link the package locally.

```bash
npm link firecms
```

### Development only

You can change the environment when deploying to FireCMS Cloud by defining the --env variable.
Possible values are `prod` (default) and `dev`.

```bash
firecms deploy --env dev
```
