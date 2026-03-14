# @rebasepro/mcp-server

MCP server for [Rebase Cloud](https://rebase.pro). Lets AI assistants manage your CMS — browse data, create/update/delete documents, manage users, and generate collection schemas with AI.

## Setup

```bash
cd packages/mcp_server && npm install && npm run build
```

## Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rebase": {
      "command": "node",
      "args": ["/path/to/packages/mcp_server/dist/cli.js"]
    }
  }
}
```

Use `rebase_login` to sign in when prompted. Tokens shared with Rebase CLI (`~/.rebase/tokens.json`).

## Tools

### Auth
| Tool | Description |
|------|-------------|
| `rebase_login` | Sign in via browser (Google OAuth) |
| `rebase_logout` | Sign out |
| `rebase_get_current_user` | Show current user |

### Projects & Users
| Tool | Description |
|------|-------------|
| `list_projects` | List Rebase Cloud projects |
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
| `rebase://projects/{id}/collections` | Project's Firestore collections |
| `rebase://projects/{id}/users` | Project users |
