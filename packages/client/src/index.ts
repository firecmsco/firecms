import { createTransport, RebaseClientConfig } from "./transport";
import { createAuth, CreateAuthOptions } from "./auth";
import { createAdmin, CreateAdminOptions } from "./admin";
import { createCollectionClient, CollectionClient } from "./collection";

export * from "./transport";
export * from "./auth";
export * from "./admin";
export * from "./collection";

export interface CreateRebaseClientOptions extends RebaseClientConfig {
    auth?: CreateAuthOptions;
    admin?: CreateAdminOptions;
}

export type RebaseClient<DB = any> = {
    auth: ReturnType<typeof createAuth>;
    admin: ReturnType<typeof createAdmin>;
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

    const collectionClients = new Map<string, any>();

    const target = {
        auth,
        admin,
        data: new Proxy(
            {
                collection<K extends keyof DB>(slug: Extract<K, string>) {
                    if (!collectionClients.has(slug)) {
                        collectionClients.set(slug, createCollectionClient(transport, slug));
                    }
                    return collectionClients.get(slug);
                }
            },
            {
                get(dataTarget, prop: string | symbol) {
                    if (prop in dataTarget) {
                        return (dataTarget as any)[prop];
                    }
                    if (typeof prop === "string" && prop !== "then") {
                        return (dataTarget as any).collection(prop);
                    }
                    return undefined;
                }
            }
        )
    } as any;

    return target;
}
