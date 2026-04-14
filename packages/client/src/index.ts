import { createTransport, RebaseClientConfig } from "./transport";
import { createAuth, CreateAuthOptions } from "./auth";
import { createAdmin, CreateAdminOptions } from "./admin";
import { createCollectionClient, CollectionClient } from "./collection";

export * from "./transport";
export * from "./auth";
export * from "./admin";
export * from "./collection";
export * from "./websocket";
export * from "./storage";

export interface CreateRebaseClientOptions extends RebaseClientConfig {
    auth?: CreateAuthOptions;
    admin?: CreateAdminOptions;
}

import { RebaseWebSocketClient } from "./websocket";
import { RebaseClient as BaseRebaseClient, RebaseData, CollectionAccessor, StorageSource } from "@rebasepro/types";

export type RebaseClient<DB = any> = BaseRebaseClient<DB> & {
    setToken: (token: string | null) => void;
    setAuthTokenGetter: (getter: () => Promise<string | null>) => void;
    setOnUnauthorized: (handler: () => Promise<boolean>) => void;
    resolveToken: () => Promise<string | null>;
    auth: ReturnType<typeof createAuth>;
    admin: ReturnType<typeof createAdmin>;
    ws?: RebaseWebSocketClient;
    storage?: StorageSource;
    call: <T = any>(endpoint: string, payload?: any) => Promise<T>;
    data: RebaseData & {
        collection<K extends keyof DB>(slug: Extract<K, string>): CollectionClient<
            DB[K] extends { Row: infer R extends Record<string, any> } ? R : any
        >;
    } & {
        [K in keyof DB]: CollectionClient<
            DB[K] extends { Row: infer R extends Record<string, any> } ? R : any
        >;
    };
};

import { createStorage } from "./storage";

/**
 * Derive a WebSocket URL from an HTTP base URL.
 * `http://` → `ws://`, `https://` → `wss://`.
 */
function deriveWebSocketUrl(baseUrl: string): string {
    return baseUrl
        .replace(/^https:\/\//, "wss://")
        .replace(/^http:\/\//, "ws://")
        .replace(/\/$/, "");
}

export function createRebaseClient<DB = any>(options: CreateRebaseClientOptions): RebaseClient<DB> {
    const transport = createTransport(options);
    const auth = createAuth(transport, options.auth);
    const admin = createAdmin(transport, options.admin);
    const storage = createStorage(transport);

    const resolvedWsUrl = options.websocketUrl ?? deriveWebSocketUrl(options.baseUrl);

    let ws: RebaseWebSocketClient | undefined;
    if (resolvedWsUrl) {
        ws = new RebaseWebSocketClient({
            websocketUrl: resolvedWsUrl,
            getAuthToken: async () => {
                const session = await auth.getSession();
                return session?.accessToken || options.token || "";
            }
        });

        auth.onAuthStateChange((event, session) => {
            if (!ws) return;
            if (event === "SIGNED_OUT") {
                ws.disconnect();
            } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                if (session?.accessToken) {
                    ws.authenticate(session.accessToken).catch(console.warn);
                }
            }
        });
    }

    // Register transport callback for 401s after auth is instantiated
    if (!options.onUnauthorized) {
        options.onUnauthorized = async () => {
            try {
                await auth.refreshSession();
                return true;
            } catch (e) {
                return false;
            }
        };
    }

    const collectionClients = new Map<string, CollectionClient<any>>();

    function collection(slug: string): CollectionClient<any> {
        if (!collectionClients.has(slug)) {
            collectionClients.set(slug, createCollectionClient(transport, slug, ws));
        }
        return collectionClients.get(slug)!;
    }

    const dataTarget = { collection } as Record<string, any>;

    const dataProxy = new Proxy(dataTarget, {
        get(_target, prop: string | symbol) {
            if (prop === "collection") {
                return collection;
            }
            if (typeof prop === "symbol") return undefined;
            if (typeof prop === "string" && prop !== "then" && prop !== "toJSON" && prop !== "$$typeof") {
                return collection(prop);
            }
            return undefined;
        }
    });

    const target = {
        auth,
        admin,
        storage,
        ws,
        setToken: transport.setToken,
        setAuthTokenGetter: transport.setAuthTokenGetter,
        setOnUnauthorized: transport.setOnUnauthorized,
        resolveToken: transport.resolveToken,
        baseUrl: transport.baseUrl,
        collection,
        call: async <T = any>(endpoint: string, payload?: any): Promise<T> => {
            const prefix = endpoint.startsWith("/") ? "" : "/";
            const res = await transport.request<{ data: T }>(`${prefix}${endpoint}`, {
                method: "POST",
                body: payload ? JSON.stringify(payload) : undefined
            });
            return res.data ?? (res as unknown as T);
        },
        data: dataProxy
    } as unknown as RebaseClient<DB>;

    return new Proxy(target, {
        get(obj, prop: string | symbol) {
            if (prop in obj) {
                return (obj as Record<string, unknown>)[prop as string];
            }
            if (typeof prop === "string" && prop !== "then") {
                return collection(prop as Extract<keyof DB, string>);
            }
            return undefined;
        }
    }) as RebaseClient<DB>;
}
