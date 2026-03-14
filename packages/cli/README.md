## Rebase CLI

This CLI tool allows you to create new Rebase projects and to deploy them to Rebase Cloud.
**IMPORTANT**: You should not be using this tool directly, but `rebase` instead.

### CLI

You can use the following commands:

```bash
rebase login
```

```bash
rebase init
```

```bash
rebase deploy
```

### Using different templates

You can initialize a new project using different templates. Please not that these templates can't
be deployed to Rebase Cloud. For example:

For Rebase Cloud

```bash
rebase init
```

For Rebase PRO:

```bash
rebase init --pro
```

#### To run locally

For development purposes, you can link the package locally.

```bash
npm link rebase
```

### Development only

You can change the environment when deploying to Rebase Cloud by defining the --env variable.
Possible values are `prod` (default) and `dev`.

```bash
rebase deploy --env dev
```
