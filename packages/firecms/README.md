## FireCMS CLI

This CLI tool allows you to create new FireCMS projects and to deploy them to FireCMS Cloud.

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

For version 2:
```bash
firecms init --v2
```

For FireCMS Community edition:
```bash
firecms init --community
```

For FireCMS PRO:
```bash
firecms init --pro
```

#### To run locally

```bash
npm link
firecms
```

### Development only
You can change the environment when deploying to FireCMS Cloud by defining the --env variable.
Possible values are `prod` (default) and `dev`.
```bash
firecms deploy --env dev
```
