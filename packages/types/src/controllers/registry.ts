import { ReactNode } from "react";
import { EntityCollection, EntityCollectionsBuilder, EntityCustomView, EntityAction } from "../types";
import { AppView } from "./navigation";

export interface RebaseCMSConfig<EC extends EntityCollection = any> {
    collections?: EC[] | EntityCollectionsBuilder<EC>;
    homePage?: ReactNode;
    entityViews?: EntityCustomView<any>[];
    entityActions?: EntityAction[];
    plugins?: any[];
}

export interface RebaseStudioConfig {
    configController?: any;
    tools?: ("sql" | "js" | "rls" | "schema" | "storage")[];
    homePage?: ReactNode;
    devViews?: AppView[];
}

export interface RebaseAuthConfig {
    loginView?: ReactNode;
}

export interface RebaseRegistryController {
    // Current state
    cmsConfig: RebaseCMSConfig | null;
    studioConfig: RebaseStudioConfig | null;
    authConfig: RebaseAuthConfig | null;

    // Registration functions
    registerCMS: (config: RebaseCMSConfig) => void;
    unregisterCMS: () => void;

    registerStudio: (config: RebaseStudioConfig) => void;
    unregisterStudio: () => void;

    registerAuth: (config: RebaseAuthConfig) => void;
    unregisterAuth: () => void;
}
