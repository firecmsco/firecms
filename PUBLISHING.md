# Publishing Packages

This monorepo uses Lerna to manage and publish all packages. Publishing is done via CI when a version tag is pushed.

## Workflow

1. **Version locally** → Creates a git tag
2. **Push to GitHub** → CI automatically publishes to npm

## Stable Releases (publishes to `latest`)

```bash
# Interactive - prompts for version type
lerna version --no-private

# Or specify the version bump directly
lerna version patch --no-private   # 3.0.1 → 3.0.2
lerna version minor --no-private   # 3.0.1 → 3.1.0
lerna version major --no-private   # 3.0.1 → 4.0.0
```

## Pre-releases

Use `--preid` to specify the pre-release identifier. The CI will automatically publish to the matching dist-tag.

```bash
# Pre-release (publishes to `pre` dist-tag)
lerna version prerelease --preid pre --no-private   # 3.0.1 → 3.0.2-pre.0

# Next release (publishes to `next` dist-tag)
lerna version prerelease --preid next --no-private  # 3.0.1 → 3.0.2-next.0

# Canary release (publishes to `canary` dist-tag)
lerna version prerelease --preid canary --no-private # 3.0.1 → 3.0.2-canary.0
```

## Automatic Canary Releases (push-to-publish)

Canary versions are published **automatically** on every push to the `canary` branch. No manual version bumping needed.

The CI workflow (`.github/workflows/publish-canary.yml`) will:
1. Build all packages
2. Generate a version like `3.1.0-canary.<short-git-sha>` (e.g., `3.1.0-canary.a1b2c3d`)
3. Publish to npm with the `canary` dist-tag

Install the latest canary with:

```bash
npm install @firecms/core@canary
```

> **Note:** If multiple pushes happen quickly to the same branch, earlier runs are automatically cancelled.

## What Happens

When you run `lerna version`:
1. Updates all `package.json` files with the new version
2. Creates a commit with the version bump
3. Creates a git tag (e.g., `v3.0.2` or `v3.0.2-pre.0`)
4. Pushes the commit and tag to GitHub

When the tag is pushed, the CI workflow (`.github/workflows/publish.yml`):
1. Builds all packages
2. Detects the dist-tag from the version suffix
3. Publishes to npm

## Installing Pre-releases

Users can install pre-release versions using:

```bash
npm install @firecms/core@pre
npm install @firecms/core@next
npm install @firecms/core@canary
```
