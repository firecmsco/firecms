import React, { useRef, useEffect } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cls, defaultBorderMixin } from "@rebasepro/ui";
import { useModeController } from "@rebasepro/core";

/** Ambient type definitions for the Rebase client SDK injected into Monaco. */
const REBASE_CLIENT_TYPES = `
// ─── Rebase Client SDK Type Definitions ─────────────────────────────

interface Entity<M extends Record<string, any> = any> {
    id: string | number;
    path: string;
    values: M;
}

interface FindParams {
    limit?: number;
    offset?: number;
    page?: number;
    where?: Record<string, string>;
    orderBy?: string;
    include?: string[];
    searchString?: string;
}

interface FindResponse<M extends Record<string, any> = any> {
    data: Entity<M>[];
    meta: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

type FilterOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "not-in" | "array-contains" | "array-contains-any" | "is" | "is_not" | "like" | "ilike";

interface QueryBuilder<M extends Record<string, any> = any> {
    where(column: keyof M & string, operator: FilterOperator, value: any): QueryBuilder<M>;
    orderBy(column: keyof M & string, direction?: "asc" | "desc"): QueryBuilder<M>;
    limit(count: number): QueryBuilder<M>;
    offset(count: number): QueryBuilder<M>;
    search(searchString: string): QueryBuilder<M>;
    find(): Promise<FindResponse<M>>;
    findOne(): Promise<Entity<M> | undefined>;
    count(): Promise<number>;
}

interface CollectionClient<M extends Record<string, any> = any> {
    find(params?: FindParams): Promise<FindResponse<M>>;
    findById(id: string | number): Promise<Entity<M> | undefined>;
    create(data: Partial<M>, id?: string | number): Promise<Entity<M>>;
    update(id: string | number, data: Partial<M>): Promise<Entity<M>>;
    delete(id: string | number): Promise<void>;
    where(column: keyof M & string, operator: FilterOperator, value: any): QueryBuilder<M>;
    orderBy(column: keyof M & string, direction?: "asc" | "desc"): QueryBuilder<M>;
    limit(count: number): QueryBuilder<M>;
    offset(count: number): QueryBuilder<M>;
    search(searchString: string): QueryBuilder<M>;
    listen?(params: FindParams | undefined, onUpdate: (response: FindResponse<M>) => void, onError?: (error: Error) => void): () => void;
    listenById?(id: string | number, onUpdate: (entity: Entity<M> | undefined) => void, onError?: (error: Error) => void): () => void;
    count?(params?: FindParams): Promise<number>;
}

interface RebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified?: boolean;
    roles?: string[];
    providerId: string;
    isAnonymous: boolean;
}

interface RebaseSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: RebaseUser;
}

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

interface RebaseAuth {
    signInWithEmail(email: string, password: string): Promise<{ user: RebaseUser; accessToken: string; refreshToken: string }>;
    signUp(email: string, password: string, displayName?: string): Promise<{ user: RebaseUser; accessToken: string; refreshToken: string }>;
    signInWithGoogle(idToken: string): Promise<{ user: RebaseUser; accessToken: string; refreshToken: string }>;
    signOut(): Promise<void>;
    refreshSession(): Promise<RebaseSession>;
    getUser(): Promise<RebaseUser>;
    updateUser(updates: { displayName?: string; photoURL?: string }): Promise<RebaseUser>;
    resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }>;
    resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }>;
    changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }>;
    sendVerificationEmail(): Promise<{ success: boolean; message: string }>;
    verifyEmail(token: string): Promise<{ success: boolean; message: string }>;
    getSessions(): Promise<any[]>;
    revokeSession(sessionId: string): Promise<{ success: boolean }>;
    revokeAllSessions(): Promise<{ success: boolean }>;
    getSession(): RebaseSession | null;
    onAuthStateChange(callback: (event: AuthChangeEvent, session: RebaseSession | null) => void): () => void;
}

interface AdminUser {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

interface RebaseRole {
    id: string;
    name: string;
    isAdmin: boolean;
    defaultPermissions: Record<string, any> | null;
    config: Record<string, any> | null;
}

interface RebaseAdmin {
    listUsers(): Promise<{ users: AdminUser[] }>;
    getUser(userId: string): Promise<{ user: AdminUser }>;
    createUser(data: { email: string; displayName?: string; password?: string; roles?: string[] }): Promise<{ user: AdminUser }>;
    updateUser(userId: string, data: { email?: string; displayName?: string; password?: string; roles?: string[] }): Promise<{ user: AdminUser }>;
    deleteUser(userId: string): Promise<{ success: boolean }>;
    listRoles(): Promise<{ roles: RebaseRole[] }>;
    getRole(roleId: string): Promise<{ role: RebaseRole }>;
    createRole(data: { id: string; name: string; isAdmin?: boolean; defaultPermissions?: any; config?: any }): Promise<{ role: RebaseRole }>;
    updateRole(roleId: string, data: { name?: string; isAdmin?: boolean; defaultPermissions?: any; config?: any }): Promise<{ role: RebaseRole }>;
    deleteRole(roleId: string): Promise<{ success: boolean }>;
    bootstrap(): Promise<{ success: boolean; message: string; user: { uid: string; roles: string[] } }>;
}

interface UploadFileProps {
    file: File;
    fileName?: string;
    path?: string;
    metadata?: Record<string, any>;
    bucket?: string;
}

interface UploadFileResult {
    path: string;
    bucket?: string;
    downloadUrl?: string;
}

interface DownloadConfig {
    url: string | null;
    fileNotFound?: boolean;
    metadata?: any;
}

interface StorageSource {
    uploadFile(props: UploadFileProps): Promise<UploadFileResult>;
    getDownloadURL(pathOrUrl: string, bucket?: string): Promise<DownloadConfig>;
    getFile(path: string, bucket?: string): Promise<File | null>;
    deleteFile(path: string, bucket?: string): Promise<void>;
    list(path: string, options?: { bucket?: string; maxResults?: number; pageToken?: string }): Promise<any>;
}

type RebaseData = {
    /** Look up a collection by slug. */
    collection(slug: string): CollectionClient;
} & {
    /** Dynamic collection access — e.g. client.data.authors */
    [collectionSlug: string]: CollectionClient;
};

/**
 * The Rebase client instance. Use \`client.data\`, \`client.auth\`, \`client.admin\`,
 * \`client.storage\`, and \`client.call()\` to interact with your Rebase backend.
 *
 * @example
 * // Query a collection
 * const result = await client.data.products.find({ limit: 10 });
 *
 * // Create a record
 * await client.data.products.create({ name: "Camera", price: 299 });
 *
 * // Fluent query
 * const expensive = await client.data.products.where("price", ">", 100).orderBy("price", "desc").limit(5).find();
 *
 * // Auth
 * const session = client.auth.getSession();
 *
 * // Admin
 * const { users } = await client.admin.listUsers();
 *
 * // Custom endpoint
 * const result = await client.call("/my-endpoint", { myData: 123 });
 */
interface RebaseClient {
    /** Data access — dynamic collection accessors */
    data: RebaseData;
    /** Authentication methods */
    auth: RebaseAuth;
    /** User/role admin methods */
    admin: RebaseAdmin;
    /** Storage operations */
    storage?: StorageSource;
    /** Call a custom server-side endpoint */
    call<T = any>(endpoint: string, payload?: any): Promise<T>;
    /** Direct collection access (shorthand) */
    [collectionSlug: string]: any;
}

/** The pre-configured client instance. Already authenticated with the current user session. */
declare const client: RebaseClient;

/** Execution context with user and collection information. */
interface JSEditorContext {
    /** The user the script is running as. */
    user: {
        uid: string;
        displayName: string | null;
        email: string | null;
        roles?: string[];
    } | null;
    /** Registered collections with their property names. */
    collections: Array<{
        slug: string;
        name: string;
        properties: string[];
    }>;
}

/** Execution context — contains info about the selected user and registered collections. */
declare const context: JSEditorContext;
`;

export type CollectionInfo = {
    slug: string;
    name: string;
    properties: string[];
};

export type JSMonacoEditorProps = {
    value: string;
    onChange: (value: string | undefined) => void;
    onRun?: (selectedText?: string) => void;
    className?: string;
    readOnly?: boolean;
    autoFocus?: boolean;
    /** Collection slugs for basic autocomplete */
    collectionSlugs?: string[];
    /** Full collection info with property names for richer type generation */
    collections?: CollectionInfo[];
};

export const JSMonacoEditor = ({
    value,
    onChange,
    onRun,
    className,
    readOnly = false,
    autoFocus = true,
    collectionSlugs = [],
    collections = []
}: JSMonacoEditorProps) => {
    const { mode } = useModeController();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const onRunRef = useRef(onRun);
    onRunRef.current = onRun;
    const typesRegisteredRef = useRef(false);

    const handleEditorOnMount: OnMount = (editorInstance, monaco) => {
        editorRef.current = editorInstance;
        monacoRef.current = monaco;

        // Register Cmd/Ctrl+Enter to run
        editorInstance.addAction({
            id: "run-script",
            label: "Run Script",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            contextMenuGroupId: "operation",
            contextMenuOrder: 0,
            run: () => {
                if (onRunRef.current) {
                    const selection = editorInstance.getSelection();
                    let selectedText: string | undefined;
                    if (selection && !selection.isEmpty()) {
                        selectedText = editorInstance.getModel()?.getValueInRange(selection)?.trim();
                    }
                    onRunRef.current(selectedText || undefined);
                }
            },
        });

        // Configure TypeScript/JavaScript defaults for richer completion
        if (!typesRegisteredRef.current) {
            typesRegisteredRef.current = true;

            // Configure TS compiler for modern JS with top-level await
            // Note: cast through `any` because the bundled type stubs mark
            // `monaco.languages.typescript` as deprecated while the runtime
            // API is fully functional.
            const ts = (monaco.languages as any).typescript;
            ts.typescriptDefaults.setCompilerOptions({
                target: ts.ScriptTarget.ESNext,
                module: ts.ModuleKind.ESNext,
                allowJs: true,
                checkJs: false,
                strict: false,
                noEmit: true,
                allowNonTsExtensions: true,
            });

            // Suppress diagnostics that don't apply to our script context.
            // Scripts are executed inside `new AsyncFunction(...)` at runtime,
            // so top-level `await` (1375) and `return` (1108) are valid.
            ts.typescriptDefaults.setDiagnosticsOptions({
                diagnosticCodesToIgnore: [1375, 1108],
            });

            // Inject the Rebase Client SDK type definitions
            ts.typescriptDefaults.addExtraLib(
                REBASE_CLIENT_TYPES,
                "ts:rebase-client.d.ts"
            );

            // Generate collection-specific types from registered collections
            if (collections.length > 0) {
                const lines: string[] = [];
                for (const col of collections) {
                    // Generate a typed interface for each collection
                    const ifaceName = col.slug.replace(/[^a-zA-Z0-9_]/g, '_');
                    const propsType = col.properties.length > 0
                        ? `{ ${col.properties.map(p => `${p}: any`).join('; ')} }`
                        : 'Record<string, any>';
                    lines.push(`/** Collection: ${col.name} (${col.slug}) */`);
                    lines.push(`interface ${ifaceName}_Row ${propsType}`);
                    lines.push(`declare namespace client.data { const ${col.slug}: CollectionClient<${ifaceName}_Row>; }`);
                }
                ts.typescriptDefaults.addExtraLib(
                    lines.join('\n'),
                    'ts:rebase-collections.d.ts'
                );
            } else if (collectionSlugs.length > 0) {
                // Fallback: just slug names without property info
                const collectionHints = collectionSlugs.map(slug =>
                    `/** Collection: ${slug} */\ndeclare namespace client.data { const ${slug}: CollectionClient; }`
                ).join('\n');
                ts.typescriptDefaults.addExtraLib(
                    collectionHints,
                    'ts:rebase-collections.d.ts'
                );
            }
        }

        if (autoFocus) {
            editorInstance.focus();
        }
    };

    return (
        <div className={cls("relative w-full h-full overflow-hidden", className)}>
            <Editor
                height="100%"
                defaultLanguage="typescript"
                path="rebase-script.ts"
                value={value}
                onChange={onChange}
                onMount={handleEditorOnMount}
                theme={mode === "dark" ? "vs-dark" : "vs"}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    readOnly,
                    tabSize: 2,
                    wordWrap: "on",
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
                }}
            />
        </div>
    );
};
