/**
 * Minimal TypeScript source generation for the collections `firecms migrate rowy` writes.
 * Values are plain objects, with two additions: `Raw` for code that must be emitted as is,
 * and `commentOn` to put `//` lines above an object's entry in its parent.
 */

const INDENT = "    ";

export class Raw {
    constructor(readonly code: string) {
    }
}

const commentsByValue = new WeakMap<object, string[]>();

/**
 * Attach comment lines to an object or array. They are written above the key that holds it.
 */
export function commentOn<T extends object>(value: T, ...lines: string[]): T {
    const existing = commentsByValue.get(value) ?? [];
    commentsByValue.set(value, [...existing, ...lines]);
    return value;
}

export function getComments(value: unknown): string[] {
    return value && typeof value === "object" ? commentsByValue.get(value) ?? [] : [];
}

export function toTs(value: unknown, depth = 0): string {
    if (value instanceof Raw) return reindent(value.code, depth);
    if (value === null) return "null";
    if (value instanceof Date) return `new Date(${JSON.stringify(value.toISOString())})`;
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return arrayToTs(value, depth);
    if (typeof value === "object") return objectToTs(value as Record<string, unknown>, depth);
    return "undefined";
}

function arrayToTs(values: unknown[], depth: number): string {
    if (values.length === 0) return "[]";
    const allPrimitive = values.every(v => v === null || ["string", "number", "boolean"].includes(typeof v));
    if (allPrimitive) {
        const inline = `[${values.map(v => toTs(v)).join(", ")}]`;
        if (inline.length <= 80) return inline;
    }
    const inner = INDENT.repeat(depth + 1);
    const items = values.map(v => commentLines(v, inner) + inner + toTs(v, depth + 1));
    return `[\n${items.join(",\n")}\n${INDENT.repeat(depth)}]`;
}

function objectToTs(object: Record<string, unknown>, depth: number): string {
    const entries = Object.entries(object).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "{}";
    // Small flat objects, like enum values, read better on one line
    if (entries.length <= 3 && entries.every(([, v]) => v === null || ["string", "number", "boolean"].includes(typeof v))) {
        const inline = `{ ${entries.map(([key, v]) => `${formatKey(key)}: ${toTs(v)}`).join(", ")} }`;
        if (inline.length <= 60) return inline;
    }
    const inner = INDENT.repeat(depth + 1);
    const lines = entries.map(([key, v]) => commentLines(v, inner) + `${inner}${formatKey(key)}: ${toTs(v, depth + 1)}`);
    return `{\n${lines.join(",\n")}\n${INDENT.repeat(depth)}}`;
}

function commentLines(value: unknown, indent: string): string {
    return getComments(value).map(line => `${indent}// ${line}\n`).join("");
}

export function formatKey(key: string) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

/**
 * Raw code is written at depth 0. Indent every line after the first to the depth it lands at.
 */
function reindent(code: string, depth: number) {
    const [first, ...rest] = code.split("\n");
    return [first, ...rest.map(line => line ? INDENT.repeat(depth) + line : line)].join("\n");
}

/**
 * A valid identifier for a table id: `blog-posts` becomes `blogPosts`.
 */
export function toIdentifier(id: string) {
    const words = id.split(/[^A-Za-z0-9]+/).filter(Boolean);
    const camel = words
        .map((word, i) => i === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    if (!camel) return "table";
    return /^[0-9]/.test(camel) ? `t${camel}` : camel;
}

/**
 * A safe file name for a table or column id.
 */
export function toFileName(id: string) {
    return id.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "table";
}
