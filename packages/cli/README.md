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
