# @firecms/mcp-server

MCP server for [FireCMS Cloud](https://firecms.co). Lets AI assistants manage your CMS — browse data, create/update/delete documents, manage collection schemas and properties, configure project settings, manage users, and generate collection schemas with AI.

> **Admin-only**: All write operations require the authenticated user to have the `admin` role on the target project. Read operations are available to any authenticated project member.

## Setup

```bash
cd packages/mcp_server && npm install && npm run build
```

## Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "firecms": {
      "command": "node",
      "args": ["/path/to/packages/mcp_server/dist/cli.js"]
    }
  }
}
```

Or use npx (no build required):

```json
{
  "mcpServers": {
    "firecms": {
      "command": "npx",
      "args": ["@firecms/mcp-server"]
    }
  }
}
```

Use `firecms_login` to sign in when prompted. Tokens shared with FireCMS CLI (`~/.firecms/tokens.json`).

## Tools

### Auth
| Tool | Description |
|------|-------------|
| `firecms_login` | Sign in via browser (Google OAuth) |
| `firecms_logout` | Sign out |
| `firecms_get_current_user` | Show current user |

### Projects & Root Collections
| Tool | Description |
|------|-------------|
| `list_projects` | List FireCMS Cloud projects |
| `get_root_collections` | List Firestore root collections |

### Project Configuration 🔒
| Tool | Description |
|------|-------------|
| `get_project_config` | Get full project config (name, colors, plan, features) |
| `update_project_name` | Rename a project |
| `update_project_colors` | Update primary/secondary brand colors |
| `update_default_locale` | Change the default locale |
| `toggle_text_search` | Enable/disable local text search |
| `toggle_entity_history` | Enable/disable entity history tracking |

### Users 🔒
| Tool | Description |
|------|-------------|
| `list_users` | List project users and roles |
| `add_user` | Invite a user |
| `update_user_roles` | Change user roles |
| `remove_user` | Remove a user |

### Collection Schemas 🔒
| Tool | Description |
|------|-------------|
| `list_collection_schemas` | List all persisted collection schemas |
| `get_collection_schema` | Get full schema for a collection |
| `save_collection_schema` | Create or replace a collection schema |
| `update_collection_schema` | Partially update a collection schema |
| `delete_collection_schema` | Delete a collection schema (data untouched) |
| `save_property` | Add or update a single property in a collection |
| `delete_property` | Remove a property from a collection schema |

### AI Schema Generation
| Tool | Description |
|------|-------------|
| `generate_collection` | AI-generate a collection schema from a prompt |
| `modify_collection` | AI-modify an existing schema from a prompt |

### Documents (Firestore CRUD)
| Tool | Description |
|------|-------------|
| `list_documents` | Query documents (filters, ordering, pagination) |
| `get_document` | Get a document by path |
| `create_document` | Create a new document |
| `update_document` | Partial update of a document |
| `delete_document` | Delete a document |
| `count_documents` | Count documents in a collection |

### Data Import & Export
| Tool | Description |
|------|-------------|
| `export_collection` | Export collection data as JSON |
| `import_documents` 🔒 | Bulk import documents (max 500/call) |

> 🔒 = Admin-only operation

## Resources

| URI | Description |
|-----|-------------|
| `firecms://projects/{id}/collections` | Firestore root-level collections |
| `firecms://projects/{id}/users` | Project users and roles |
| `firecms://projects/{id}/schemas` | All collection schemas (full config tree) |
| `firecms://projects/{id}/config` | Project configuration snapshot |

## Example Workflows

### Create a collection from scratch
```
1. firecms_login          → authenticate
2. list_projects          → pick your project
3. save_collection_schema → define the schema
4. import_documents       → seed with initial data
```

### AI-assisted schema creation
```
1. generate_collection    → describe what you want in natural language
2. save_collection_schema → persist the generated schema
```

### Modify an existing collection
```
1. get_collection_schema  → read current schema
2. save_property          → add/update individual fields
3. update_collection_schema → update display settings
```

## Security

- **Authentication**: Google OAuth via browser, same as `firecms login` CLI
- **Authorization**: Write operations enforce admin role check per project
- **Token storage**: `~/.firecms/tokens.json` (shared with CLI)
- **Admin cache**: Role checks are cached for 5 minutes per project
