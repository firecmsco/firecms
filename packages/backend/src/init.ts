import { DataDriver, EntityCollection, BackendBootstrapper, BootstrappedAuth, RealtimeProvider } from "@rebasepro/types";
import { BackendCollectionRegistry } from "./collections/BackendCollectionRegistry";
import { loadCollectionsFromDirectory } from "./collections/loader";
import { DriverRegistry, DEFAULT_DRIVER_ID, DefaultDriverRegistry } from "./services/driver-registry";
import { Server } from "http";

import { RestApiGenerator } from "./api/rest/api-generator";
import { createAuthMiddleware } from "./auth/middleware";
import { errorHandler } from "./api/errors";
import { Hono } from "hono";
import { HonoEnv } from "./api/types";
import { configureLogLevel } from "./utils/logging";
import { createAdminRoutes, createAuthRoutes, requireAuth, requireAdmin } from "./auth";
import { createStorageController, createStorageRoutes, DEFAULT_STORAGE_ID, DefaultStorageRegistry, BackendStorageConfig, StorageController, StorageRegistry } from "./storage";
import { createHistoryRoutes } from "./history";

export interface RebaseBackendConfig {
    collections?: EntityCollection[];
    collectionsDir?: string;
    server: Server;
    app: Hono<HonoEnv>;
    basePath?: string;
    bootstrappers: BackendBootstrapper[];
    logging?: {
        level?: "error" | "warn" | "info" | "debug";
    };
    auth?: unknown;
    storage?: BackendStorageConfig | Record<string, BackendStorageConfig>;
    history?: unknown;
    enableSwagger?: boolean;
}

export interface RebaseBackendInstance {
    driverRegistry: DriverRegistry;
    driver: DataDriver;
    realtimeServices: Record<string, RealtimeProvider>;
    realtimeService: RealtimeProvider;
    auth?: BootstrappedAuth;
    history?: any;
    storageRegistry?: StorageRegistry;
    storageController?: StorageController;
    collectionRegistry: BackendCollectionRegistry;
}

export async function initializeRebaseBackend(config: RebaseBackendConfig): Promise<RebaseBackendInstance> {
    try {
        return await _initializeRebaseBackend(config);
    } catch (error: unknown) {
        console.error("❌ Critical error during Rebase Backend initialization:", error);

        const basePath = config.basePath || "/api";
        config.app.use(`${basePath}/*`, async (c) => {
            return c.json({
                error: {
                    message: "Backend initialization failed. Please check the backend server logs.",
                    code: "backend-init-failed"
                }
            }, 503);
        });

        return {
            __failed: true,
            driverRegistry: DefaultDriverRegistry.create({}),
            driver: {} as unknown as DataDriver,
            realtimeServices: {},
            realtimeService: {} as unknown as RealtimeProvider,
        } as unknown as RebaseBackendInstance;
    }
}

async function _initializeRebaseBackend(config: RebaseBackendConfig): Promise<RebaseBackendInstance> {
    if (config.logging?.level) {
        configureLogLevel(config.logging.level);
    } else {
        configureLogLevel();
    }

    console.log("🔥 Initializing Rebase Backend (Bootstrapper Protocol V2)");

    const collectionRegistry = new BackendCollectionRegistry();
    let activeCollections = config.collections || [];
    if (config.collectionsDir && activeCollections.length === 0) {
        activeCollections = await loadCollectionsFromDirectory(config.collectionsDir);
        console.log(`📁 Auto-discovered ${activeCollections.length} collections from ${config.collectionsDir}`);
    }

    const realtimeServices: Record<string, RealtimeProvider> = {};
    const delegates: Record<string, DataDriver> = {};
    const bootstrappers = config.bootstrappers || [];

    if (bootstrappers.length === 0) {
        throw new Error("No bootstrappers provided. Cannot initialize database drivers.");
    }

    let defaultDriverId = DEFAULT_DRIVER_ID;

    let defaultDriverResult: import("@rebasepro/types").InitializedDriver | undefined = undefined;

    // 1. Initialize all drivers
    for (const bootstrapper of bootstrappers) {
        const b = bootstrapper as any;
        console.log(`📦 Running bootstrapper for driver: "${b.id || bootstrapper.type}"`);
        if (b.isDefault) {
            defaultDriverId = b.id || bootstrapper.type;
        }

        const driverResult = await bootstrapper.initializeDriver({ collections: activeCollections, collectionRegistry });
        delegates[b.id || bootstrapper.type] = driverResult.driver;
        
        if ((b.id || bootstrapper.type) === defaultDriverId || !defaultDriverResult) {
            defaultDriverResult = driverResult;
        }

        if (bootstrapper.initializeRealtime) {
            const realtime = await bootstrapper.initializeRealtime({}, driverResult);
            realtimeServices[b.id || bootstrapper.type] = realtime as RealtimeProvider;
        }
    }

    const driverRegistry = DefaultDriverRegistry.create(delegates);
    activeCollections.forEach(collection => collectionRegistry.register(collection));

    const defaultDriver = driverRegistry.getOrDefault(defaultDriverId);
    if (!defaultDriver || !defaultDriverResult) {
        throw new Error("Default driver not initialized by bootstrappers");
    }
    const defaultBootstrapper = bootstrappers.find(b => (b as any).id === defaultDriverId || b.type === defaultDriverId) || bootstrappers[0];
    const defaultRealtimeService = defaultDriverResult.realtimeProvider;

    // 2. Initialize Auth & History via the default driver's bootstrapper
    let authConfigResult: BootstrappedAuth | undefined = undefined;
    if (config.auth) {
        if (defaultBootstrapper.initializeAuth) {
            console.log("🔐 Bootstrapping authentication via driver protocol...");
            authConfigResult = await defaultBootstrapper.initializeAuth(config.auth, defaultDriverResult);
            console.log("✅ Authentication initialized");
        } else {
            console.warn("⚠️ Auth requested but default bootstrapper does not support initializeAuth");
        }
    }

    let historyConfigResult: any = undefined;
    if (config.history) {
        if ((defaultBootstrapper as any).initializeHistory) {
            console.log("📜 Bootstrapping entity history via driver protocol...");
            historyConfigResult = await (defaultBootstrapper as any).initializeHistory(defaultDriver, config.history);
            console.log("✅ Entity history initialized");
        } else {
            console.warn("⚠️ History requested but default bootstrapper does not support initializeHistory");
        }
    }

    // 3. Initialize Storage
    let storageRegistry: StorageRegistry | undefined;
    let storageController: StorageController | undefined;

    if (config.storage) {
        console.log("📁 Configuring storage...");
        const controllers: Record<string, StorageController> = {};

        if (typeof config.storage === "object" && "type" in config.storage) {
            const controller = createStorageController(config.storage as any);
            controllers[DEFAULT_STORAGE_ID] = controller;
        } else {
            for (const [storageId, storageConfig] of Object.entries(config.storage as Record<string, any>)) {
                controllers[storageId] = createStorageController(storageConfig);
            }
        }

        if (Object.keys(controllers).length > 0) {
            storageRegistry = DefaultStorageRegistry.create(controllers);
            storageController = storageRegistry.getDefault();
            console.log(`✅ Initialized ${Object.keys(controllers).length} storage backend(s)`);
        }
    }

    const basePath = config.basePath || "/api";

    // 4. Mount API Routes
    if (config.auth && authConfigResult) {
        const authRoutes = createAuthRoutes({
            authRepo: (authConfigResult as any).authRepository ?? (authConfigResult as any).userService,
            emailService: authConfigResult.emailService as any,
            emailConfig: (config.auth as any).email,
            allowRegistration: (config.auth as any).allowRegistration ?? false
        });
        config.app.route(`${basePath}/auth`, authRoutes);

        const adminRoutes = createAdminRoutes({ 
            authRepo: (authConfigResult as any).authRepository ?? (authConfigResult as any).userService,
            emailService: authConfigResult.emailService as any,
            emailConfig: (config.auth as any).email,
        });
        config.app.route(`${basePath}/admin`, adminRoutes);
    }

    if (config.collectionsDir) {
        if (process.env.NODE_ENV !== "production") {
            const { createSchemaEditorRoutes } = await import("./api/schema-editor-routes");
            const schemaEditorRoutes = createSchemaEditorRoutes(config.collectionsDir);
            
            if ((config.auth as any)?.requireAuth !== false && !!(config.auth as any)?.jwtSecret) {
                schemaEditorRoutes.use("/*", requireAuth, requireAdmin);
            }
            
            config.app.route(`${basePath}/schema-editor`, schemaEditorRoutes);
            console.log(`✅ Schema Editor mounted at ${basePath}/schema-editor`);
        }
    }

    if (storageController) {
        const storageRoutes = createStorageRoutes({
            controller: storageController,
            requireAuth: (config.auth as any)?.requireAuth ?? true
        });
        config.app.route(`${basePath}/storage`, storageRoutes);
    }

    if (activeCollections.length > 0) {
        const dataRouter = new Hono<HonoEnv>();

        dataRouter.use("/*", createAuthMiddleware({
            driver: defaultDriver,
            requireAuth: (config.auth as any)?.requireAuth !== false && !!(config.auth as any)?.jwtSecret
        }));

        const restGenerator = new RestApiGenerator(activeCollections, defaultDriver);
        dataRouter.route("/", restGenerator.generateRoutes());

        if (historyConfigResult && historyConfigResult.historyService) {
            const historyRoutes = createHistoryRoutes({
                historyService: historyConfigResult.historyService as any,
                registry: collectionRegistry,
                driver: defaultDriver
            });
            dataRouter.route("/", historyRoutes);
        }

        config.app.route(`${basePath}/data`, dataRouter);
    }

    if ((defaultBootstrapper as any).initializeWebsockets) {
        await (defaultBootstrapper as any).initializeWebsockets(config.server, defaultRealtimeService, defaultDriver, config.auth);
    }

    console.log("✅ Rebase Backend Initialized");

    return {
        driverRegistry,
        driver: defaultDriver,
        realtimeServices,
        realtimeService: defaultRealtimeService,
        auth: authConfigResult,
        history: historyConfigResult,
        storageRegistry,
        storageController,
        collectionRegistry
    };
}
