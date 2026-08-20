import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FireCMSApiClient } from "./api-client.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerUserTools } from "./tools/users.js";
import { registerCollectionTools } from "./tools/collections.js";
import { registerCollectionSchemaTools } from "./tools/collection-schemas.js";
import { registerDocumentTools } from "./tools/documents.js";
import { registerExportTools } from "./tools/export.js";
import { registerImportTools } from "./tools/import.js";
import { registerProjectConfigTools } from "./tools/project-config.js";
import { registerOnboardingTools } from "./tools/onboarding.js";
import { registerIntrospectionTools } from "./tools/introspection.js";
import { registerProjectResources } from "./resources/project.js";

/**
 * Create and configure the FireCMS MCP server with all tools and resources.
 *
 * Tool categories:
 * - Auth:              Login/logout/current user
 * - Onboarding:        Connect an existing Firebase project to FireCMS Cloud
 * - Projects:          List projects, root collections
 * - Introspection:     Infer collections from the data already in Firestore
 * - Project Config:    Name, colors, locale, feature toggles (admin-only)
 * - Users:             User management (invite, roles, remove)
 * - Collection Schemas: CRUD for collection configurations (admin-only)
 * - AI Collections:    AI-powered schema generation/modification
 * - Documents:         Firestore CRUD (list, get, create, update, delete, count)
 * - Export:            Data export as JSON
 * - Import:            Bulk data import (admin-only)
 * - Resources:         Read-only context (collections, users, schemas, config)
 */
/**
 * Read the package version, so the version reported over MCP cannot drift from the
 * published one (it was pinned at "0.2.0" while the package was at 3.3.0).
 */
function packageVersion(): string {
    try {
        const here = path.dirname(fileURLToPath(import.meta.url));
        const pkg = JSON.parse(fs.readFileSync(path.join(here, "..", "package.json"), "utf-8"));
        return pkg.version ?? "0.0.0";
    } catch {
        return "0.0.0";
    }
}

export function createFireCMSMcpServer(): McpServer {
    const server = new McpServer({
        name: "FireCMS Cloud",
        version: packageVersion(),
    });

    const api = new FireCMSApiClient();

    // Auth tools (login/logout)
    registerAuthTools(server);

    // Onboarding — connect an existing Firebase project. Registered before the
    // project tools because it is the first thing a new user needs.
    registerOnboardingTools(server, api);

    // Project & user management (via backend API)
    registerProjectTools(server, api);
    registerUserTools(server, api);

    // Introspection — turn existing Firestore data into collections
    registerIntrospectionTools(server, api);

    // Project configuration (admin-only)
    registerProjectConfigTools(server, api);

    // Collection schema CRUD (admin-only — the core feature for agent-driven CMS management)
    registerCollectionSchemaTools(server, api);

    // Collection schema AI tools (via backend API)
    registerCollectionTools(server, api);

    // Firestore document CRUD (via backend API proxy)
    registerDocumentTools(server, api);

    // Data export (via backend API)
    registerExportTools(server, api);

    // Data import (admin-only)
    registerImportTools(server, api);

    // Resources (read-only contextual data)
    registerProjectResources(server, api);

    return server;
}
