import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";
import { describeError } from "./errors.js";

/**
 * Register collection schema tools.
 */
export function registerCollectionTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "generate_collection",
        {
            title: "Generate a collection with AI",
            description: `Generate a new FireCMS collection schema using AI. Provide a natural language description 
of the collection you want (e.g., "A blog with posts that have title, body, author, tags, 
and a featured image"). Returns a complete FireCMS collection configuration.`,
            inputSchema: {
                prompt: z.string().describe("Natural language description of the collection to generate"),
                existingCollections: z.array(z.record(z.any())).optional().describe("Optional existing collection schemas for context"),
            },
            annotations: { title: "Generate a collection with AI", readOnlyHint: true },
        },
        async ({ prompt, existingCollections }) => {
            try {
                const result = await api.generateCollection(prompt, existingCollections ?? []);
                return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }], isError: true };
            }
        }
    );

    server.registerTool(
        "modify_collection",
        {
            title: "Modify a collection with AI",
            description: `Modify an existing FireCMS collection schema using AI. Describe the changes you want 
(e.g., "Add a priority enum with low/medium/high" or "Make title required with max 100 chars").
Returns the updated schema and a list of operations performed.`,
            inputSchema: {
                prompt: z.string().describe("Description of the modifications"),
                existingCollection: z.record(z.any()).describe("The current collection schema to modify"),
                existingCollections: z.array(z.record(z.any())).optional().describe("Optional list of all collection schemas for context"),
            },
            annotations: { title: "Modify a collection with AI", readOnlyHint: true },
        },
        async ({ prompt, existingCollection, existingCollections }) => {
            try {
                const result = await api.generateCollection(prompt, existingCollections ?? [], existingCollection);
                return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }], isError: true };
            }
        }
    );
}
