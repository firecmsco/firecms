import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
    buildInferredCollectionFromData,
    inferTypeFromValue,
    lastPathSegment,
} from "@firecms/schema_inference";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Maps a value to a `DataType` for documents that arrived as JSON over HTTP.
 *
 * The backend's document endpoints run every document through
 * `serializeFirestoreValues`, which encodes the Firestore-specific types as plain
 * objects:
 *
 *   Timestamp          → { _seconds, _nanoseconds }
 *   DocumentReference  → { _ref: "collection/docId" }
 *   GeoPoint           → { _lat, _long }
 *
 * This is the only part of inference that differs here from the web client, which
 * receives real SDK instances and can use `instanceof`. Without it all three would
 * be inferred as plain maps.
 */
function inferSerializedType(value: any) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        if ("_seconds" in value && "_nanoseconds" in value) return "date";
        if ("_ref" in value && typeof value._ref === "string") return "reference";
        if ("_lat" in value && "_long" in value) return "geopoint";
    }
    return inferTypeFromValue(value);
}

function formatError(error: any): string {
    const data = error.response?.data;
    const message = data?.message ?? data?.error ?? error.message ?? "";

    // A project connected moments ago answers PERMISSION_DENIED until its delegated
    // service account's roles finish propagating in IAM — usually well under a
    // minute. The backend surfaces this as a generic internal-error, so without
    // this the agent has no way to tell a transient state from a real misconfiguration.
    if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(String(message))) {
        return `${message}\n\nIf this project was connected in the last minute, its service ` +
            `account's permissions are probably still propagating — wait a moment and try again. ` +
            `Otherwise check that the signed-in account still has access to the project.`;
    }
    return message;
}

/**
 * Register the tools that look at the data already in a project's Firestore and turn
 * it into FireCMS collections.
 */
export function registerIntrospectionTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. Databases ──────────────────────────────────────

    server.registerTool(
        "list_databases",
        {
            description:
                "List the Firestore databases of a project. Only needed for projects using more " +
                "than the '(default)' database — the resulting database IDs can be passed to the " +
                "other introspection and document tools.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId }) => {
            try {
                await api.assertAdmin(projectId);
                const databases = await api.listDatabases(projectId);
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(databases, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 2. Non-destructive schema preview ─────────────────

    server.registerTool(
        "preview_inferred_schema",
        {
            description:
                "Read a sample of real documents from a Firestore path and infer a FireCMS " +
                "collection schema from them, WITHOUT saving anything.\n\n" +
                "Use this to inspect what a collection would look like, to adjust it before " +
                "persisting, or to build a schema for a subcollection or a path that " +
                "infer_collections_from_data would skip. Feed the result to save_collection_schema " +
                "once it looks right.\n\n" +
                "Inference is structural only — it derives data types, enum candidates and " +
                "validation from the sampled values. For display names and grouping chosen by an " +
                "LLM, use infer_collections_from_data instead.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                path: z.string().describe("Firestore collection path, e.g. 'products' or 'users/{userId}/orders'"),
                sampleSize: z.number().min(1).max(200).optional()
                    .describe("How many documents to sample (default 30, max 200). More samples give better enum and optionality detection."),
                databaseId: z.string().optional().describe("Firestore database ID, if not '(default)'"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, path, sampleSize, databaseId }) => {
            try {
                await api.assertAdmin(projectId);

                const limit = sampleSize ?? 30;
                const response: any = await api.listDocuments(projectId, { path, limit, databaseId });
                const documents: any[] = response?.documents ?? response?.data ?? [];

                if (documents.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `No documents found at "${path}". A schema cannot be inferred from an ` +
                                `empty collection — create the collection manually with save_collection_schema instead.`,
                        }],
                        isError: true,
                    };
                }

                const data = documents
                    .map((doc: any) => doc.values ?? doc.data ?? doc)
                    .filter(Boolean);

                // Same inference the web client and the backend run — see
                // `buildInferredCollectionFromData` in @firecms/schema_inference.
                const inferred = await buildInferredCollectionFromData(path, data, inferSerializedType);

                const collection = {
                    id: lastPathSegment(path),
                    ...inferred,
                    ...(databaseId ? { databaseId } : {}),
                };

                return {
                    content: [{
                        type: "text" as const,
                        text: `Inferred from ${data.length} document(s) at "${path}". ` +
                            `Nothing has been saved — pass this to save_collection_schema to persist it.\n\n` +
                            JSON.stringify(collection, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error inferring schema: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 3. Server-side inference for chosen paths ─────────

    server.registerTool(
        "infer_collections_from_data",
        {
            description:
                "Infer collections from the existing Firestore data at the given paths, and SAVE " +
                "them to the project.\n\n" +
                "For each path the backend samples documents, infers the property types, then uses " +
                "an LLM to pick display names, a singular name, an icon, a navigation group and " +
                "sensible field widgets. Paths already mapped to a collection are skipped.\n\n" +
                "This is the fastest way to bring an existing project into FireCMS. Use " +
                "get_root_collections first to see what paths exist, or setup_all_collections to " +
                "do every root collection at once.\n\n" +
                "Writes to the project — requires admin.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                paths: z.array(z.object({
                    path: z.string().describe("Firestore collection path, e.g. 'products'"),
                    databaseId: z.string().optional().describe("Firestore database ID, if not '(default)'"),
                })).min(1).describe("The collection paths to infer and save"),
            },
        },
        async ({ projectId, paths }) => {
            try {
                await api.assertAdmin(projectId);

                // Guard against inferring from nothing. The backend runs its LLM pass
                // even when a path has no documents to sample, and the model then
                // invents a plausible-looking schema from the path name alone — e.g.
                // an empty "articles" path yields title/slug/status/author fields that
                // exist nowhere in the data. Persisting that is worse than failing.
                const empty: string[] = [];
                for (const target of paths) {
                    try {
                        const probe: any = await api.listDocuments(projectId, {
                            path: target.path,
                            limit: 1,
                            databaseId: target.databaseId,
                        });
                        if ((probe?.documents ?? probe?.data ?? []).length === 0) {
                            empty.push(target.path);
                        }
                    } catch {
                        // If the probe itself fails, let the real call report the error.
                    }
                }

                const usable = paths.filter((p) => !empty.includes(p.path));
                if (usable.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `No documents found at ${empty.map((p) => `"${p}"`).join(", ")}. ` +
                                `Inference needs real documents to read — with none, the schema would be ` +
                                `invented from the path name rather than derived from your data.\n\n` +
                                `Create the collection explicitly with save_collection_schema instead, ` +
                                `or import data first with import_documents.`,
                        }],
                        isError: true,
                    };
                }

                const result = await api.setupCollections(projectId, usable);
                const collections = result?.collections ?? [];

                if (collections.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `No collections were created — every requested path is already ` +
                                `mapped to a collection. Use list_collection_schemas to see them.`,
                        }],
                    };
                }

                const summary = collections
                    .map((c: any) => `  - ${c.name ?? c.id} (${c.path}), ${Object.keys(c.properties ?? {}).length} properties`)
                    .join("\n");
                const skipped = empty.length
                    ? `\n\nSkipped ${empty.map((p) => `"${p}"`).join(", ")} — no documents to infer from.`
                    : "";

                return {
                    content: [{
                        type: "text" as const,
                        text: `Created ${collections.length} collection(s):\n${summary}${skipped}\n\n` +
                            JSON.stringify(collections, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error inferring collections: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 4. Do the whole project ───────────────────────────

    server.registerTool(
        "setup_all_collections",
        {
            description:
                "Discover every Firestore root collection in the project that is not yet mapped, " +
                "infer a collection schema for each, and save them all.\n\n" +
                "This is the one-shot way to populate a newly connected project. It is the same " +
                "inference as infer_collections_from_data, applied to every unmapped root " +
                "collection across all databases. Collections that already exist are left alone, " +
                "so it is safe to run again later to pick up new Firestore collections.\n\n" +
                "Can take a while on large projects. Writes to the project — requires admin.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                databaseId: z.string().optional().describe("Firestore database ID, if not '(default)'"),
            },
        },
        async ({ projectId, databaseId }) => {
            try {
                await api.assertAdmin(projectId);

                // Discovery is done here rather than by the backend's `initial_setup`,
                // which resolves root collections through a 5-minute cache and therefore
                // silently does nothing for collections created since the last lookup —
                // including every collection of a project connected moments ago.
                const rootCollections = await api.listRootCollectionsLive(projectId, { databaseId });
                if (rootCollections.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `This project's Firestore has no root collections, so there is ` +
                                `nothing to infer. Add data first, or create collections explicitly ` +
                                `with save_collection_schema.`,
                        }],
                    };
                }

                const existing = await api.listCollectionSchemas(projectId);
                const mapped = new Set(existing.map((c: any) => c.path ?? c.id));
                const unmapped = rootCollections.filter((path) => !mapped.has(path));

                if (unmapped.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Nothing to do — all ${rootCollections.length} root collection(s) ` +
                                `are already mapped: ${rootCollections.join(", ")}.`,
                        }],
                    };
                }

                const result = await api.setupCollections(
                    projectId,
                    unmapped.map((path) => ({ path, ...(databaseId ? { databaseId } : {}) }))
                );
                const collections = result?.collections ?? [];

                if (collections.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `No collections were created from ${unmapped.join(", ")}.`,
                        }],
                    };
                }

                const summary = collections
                    .map((c: any) => `  - ${c.name ?? c.id} (${c.path}), ${Object.keys(c.properties ?? {}).length} properties`)
                    .join("\n");

                return {
                    content: [{
                        type: "text" as const,
                        text: `Set up ${collections.length} collection(s) from ${rootCollections.length} ` +
                            `root collection(s):\n${summary}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error setting up collections: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );
}
