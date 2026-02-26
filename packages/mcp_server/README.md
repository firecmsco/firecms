# @firecms/mcp-server

MCP server for [FireCMS Cloud](https://firecms.co). Lets AI assistants manage your CMS — browse data, create/update/delete documents, manage users, and generate collection schemas with AI.

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

Use `firecms_login` to sign in when prompted. Tokens shared with FireCMS CLI (`~/.firecms/tokens.json`).

## Tools

### Auth
| Tool | Description |
|------|-------------|
| `firecms_login` | Sign in via browser (Google OAuth) |
| `firecms_logout` | Sign out |
| `firecms_get_current_user` | Show current user |

### Projects & Users
| Tool | Description |
|------|-------------|
| `list_projects` | List FireCMS Cloud projects |
| `get_root_collections` | List Firestore root collections |
| `list_users` | List project users and roles |
| `add_user` | Invite a user |
| `update_user_roles` | Change user roles |
| `remove_user` | Remove a user |

### Documents (Firestore CRUD)
| Tool | Description |
|------|-------------|
| `list_documents` | Query documents (filters, ordering, pagination) |
| `get_document` | Get a document by path |
| `create_document` | Create a new document |
| `update_document` | Partial update of a document |
| `delete_document` | Delete a document |
| `count_documents` | Count documents in a collection |

### AI & Export
| Tool | Description |
|------|-------------|
| `generate_collection` | AI-generate a collection schema |
| `modify_collection` | AI-modify an existing schema |
| `export_collection` | Export collection data as JSON |

## Resources

| URI | Description |
|-----|-------------|
| `firecms://projects/{id}/collections` | Project's Firestore collections |
| `firecms://projects/{id}/users` | Project users |
