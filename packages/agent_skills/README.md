# FireCMS Agent Skills

[Agent Skills](https://agentskills.io) that teach AI coding agents to work with
[FireCMS](https://firecms.co): the `@firecms/ui` component kit and how FireCMS screens are
composed, collections and properties, custom views and fields, and FireCMS Cloud.

| Skill | What it covers |
|---|---|
| `firecms-ui-components` | Every `@firecms/ui` component, its props, the theme tokens and the icons. |
| `firecms-design-language` | How FireCMS views are laid out, with skeletons for list, settings, dashboard, side panel and dialog screens. |
| `firecms-basics` | Editions, project layout, commands and where the docs are. |
| `firecms-collections` | `buildCollection`, properties of every data type, permissions, callbacks. |
| `firecms-custom-views` | Top-level views, entity views, custom fields and the hooks they use. |
| `firecms-cloud` | FireCMS Cloud projects and the FireCMS MCP server. |

## Getting them

**Over MCP, with nothing installed.** The FireCMS MCP server serves these skills to clients that
read skills over MCP (Claude Code, Claude). Connect `https://api.firecms.co/mcp`, or run the
local server with `npx -y @firecms/mcp-server`, and the skills appear as `<server>:firecms-…`.

**As files in your project.**

```bash
npx skills add firecmsco/firecms
```

or copy them from this package:

```bash
pnpm add -D @firecms/agent-skills
cp -R node_modules/@firecms/agent-skills/skills/* .claude/skills/
```

## Writing a skill

Each skill is a folder under `skills/` with a `SKILL.md` whose frontmatter has a `name` equal to
the folder name and a one-line `description` saying when to use it. Keep `SKILL.md` under about
60 KB and the folder under about 350 KB; put long material in `references/`. Every API a skill
names must exist in the current source.
