import { createTransport, RebaseClientConfig } from "./transport";
import { createAuth, CreateAuthOptions } from "./auth";
import { createAdmin, CreateAdminOptions } from "./admin";
import { createCollectionClient, CollectionClient } from "./collection";

export * from "./transport";
export * from "./auth";
export * from "./admin";
export * from "./collection";
export * from "./websocket";

export interface CreateRebaseClientOptions extends RebaseClientConfig {
    auth?: CreateAuthOptions;
    admin?: CreateAdminOptions;
}

import { RebaseWebSocketClient } from "./websocket";

export type RebaseClient<DB = any> = {
    auth: ReturnType<typeof createAuth>;
    admin: ReturnType<typeof createAdmin>;
    ws?: RebaseWebSocketClient;
    data: {
        collection<K extends keyof DB>(slug: Extract<K, string>): CollectionClient<
            DB[K] extends { Row: infer R } ? R : any,
            DB[K] extends { Insert: infer I } ? I : any,
            DB[K] extends { Update: infer U } ? U : any
        >;
    } & {
        [K in keyof DB]: CollectionClient<
            DB[K] extends { Row: infer R } ? R : any,
            DB[K] extends { Insert: infer I } ? I : any,
            DB[K] extends { Update: infer U } ? U : any
        >;
    };
};

export function createRebaseClient<DB = any>(options: CreateRebaseClientOptions): RebaseClient<DB> {
    const transport = createTransport(options);
    const auth = createAuth(transport, options.auth);
    const admin = createAdmin(transport, options.admin);

    let ws: RebaseWebSocketClient | undefined;
    if (options.websocketUrl) {
        ws = new RebaseWebSocketClient({
            websocketUrl: options.websocketUrl,
            getAuthToken: async () => {
                const session = await auth.getSession();
                return session?.accessToken || "";
            }
        });
    }

    // Register transport callback for 401s after auth is instantiated
    if (!options.onUnauthorized) {
        // NOTE: we need a way to mock or overwrite onUnauthorized on the transport.
        // Actually, the transport accesses config.onUnauthorized directly per request,
        // so we can just mutate the options object.
        options.onUnauthorized = async () => {
            try {
                await auth.refreshSession();
                return true;
            } catch (e) {
                return false;
            }
        };
    }

    const collectionClients = new Map<string, CollectionClient<unknown, unknown, unknown>>();

    function collection<K extends keyof DB>(slug: Extract<K, string>) {
        if (!collectionClients.has(slug)) {
            collectionClients.set(slug, createCollectionClient(transport, slug, ws));
        }
        return collectionClients.get(slug);
    }

    const dataProxy = new Proxy(
        { collection },
        {
            get(dataTarget, prop: string | symbol) {
                if (prop in dataTarget) {
                    return (dataTarget as Record<string, unknown>)[prop as string];
                }
                if (typeof prop === "string" && prop !== "then") {
                    return (dataTarget as Record<string, unknown> & { collection: (slug: string) => CollectionClient<unknown, unknown, unknown> }).collection(prop);
                }
                return undefined;
            }
        }
    );

    const target = {
        auth,
        admin,
        ws,
        collection,
        data: dataProxy
    };

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
