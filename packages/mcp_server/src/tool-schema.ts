import { z, type ZodRawShape } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type {
    CallToolResult,
    McpServer,
    RegisteredTool,
    ServerContext,
    StandardSchemaWithJSON,
    ToolAnnotations,
} from "@modelcontextprotocol/server";

/**
 * The tools' argument schemas are written with zod 3 (`z.record(z.any())` and the
 * other spellings zod 4 dropped). MCP SDK v2 takes any Standard Schema that also
 * implements Standard JSON Schema, which zod 3 does not: it validates (`~standard`)
 * but has no `~standard.jsonSchema`.
 *
 * This adds that half with `zod-to-json-schema`, called exactly as SDK 1.x called it
 * for a zod 3 shape (`strictUnions`, `pipeStrategy`). So `tools/list` advertises the
 * same JSON Schema, byte for byte, as the 1.x server did, and arguments are still
 * validated, defaulted and typed by the same zod schemas.
 */
export type ZodToolInput<Shape extends ZodRawShape> =
    StandardSchemaWithJSON<z.input<z.ZodObject<Shape>>, z.output<z.ZodObject<Shape>>>;

export function zodToolInput<Shape extends ZodRawShape>(shape: Shape): ZodToolInput<Shape> {
    const schema = z.object(shape);
    const standard = schema["~standard"];
    // Converted once, on first use: tools/list asks for it on every listing.
    let input: Record<string, unknown> | undefined;
    let output: Record<string, unknown> | undefined;
    return {
        "~standard": {
            version: 1,
            vendor: standard.vendor,
            validate: (value) => standard.validate(value),
            jsonSchema: {
                input: () => input ??= zodToJsonSchema(schema, { strictUnions: true, pipeStrategy: "input" }),
                output: () => output ??= zodToJsonSchema(schema, { strictUnions: true, pipeStrategy: "output" }),
            },
        },
    };
}

/** What a FireCMS tool declares, with its arguments as a zod 3 shape. */
export interface ZodToolConfig<Shape extends ZodRawShape> {
    title?: string;
    description?: string;
    inputSchema: Shape;
    annotations?: ToolAnnotations;
    _meta?: Record<string, unknown>;
}

/**
 * `server.registerTool` for a tool whose arguments are a zod 3 shape. A tool without
 * arguments registers with `server.registerTool` directly: it has no schema to convert,
 * and the SDK advertises the same empty object schema 1.x did.
 */
export function registerTool<Shape extends ZodRawShape>(
    server: McpServer,
    name: string,
    { inputSchema, ...config }: ZodToolConfig<Shape>,
    handler: (args: z.output<z.ZodObject<Shape>>, ctx: ServerContext) => CallToolResult | Promise<CallToolResult>
): RegisteredTool {
    return server.registerTool(name, { ...config, inputSchema: zodToolInput(inputSchema) }, handler);
}
