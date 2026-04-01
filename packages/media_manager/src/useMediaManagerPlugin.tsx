import React, { useMemo, createContext, useContext, PropsWithChildren } from "react";
import { FireCMSPlugin, CMSView, useTranslation } from "@firecms/core";
import { MediaManagerConfig } from "./types";
import { MediaManagerProvider } from "./MediaManagerProvider";
import { useMediaManagerController } from "./useMediaManagerController";
import { MediaLibraryCard } from "./components/MediaLibraryCard";
import { MediaLibraryView } from "./components/MediaLibraryView";
import { mediaManagerTranslationsEn } from "./locales/en";
import { mediaManagerTranslationsEs } from "./locales/es";
import { mediaManagerTranslationsDe } from "./locales/de";
import { mediaManagerTranslationsFr } from "./locales/fr";
import { mediaManagerTranslationsIt } from "./locales/it";
import { mediaManagerTranslationsHi } from "./locales/hi";
import { mediaManagerTranslationsPt } from "./locales/pt";

const DEFAULT_STORAGE_PATH = "media";
const DEFAULT_COLLECTION_PATH = "media_assets";

export interface MediaManagerPluginProps extends MediaManagerConfig { }

// Context to store the config
const MediaManagerConfigContext = createContext<MediaManagerConfig | null>(null);

function useMediaManagerConfig(): MediaManagerConfig {
    const config = useContext(MediaManagerConfigContext);
    if (!config) {
        throw new Error("useMediaManagerConfig must be used within MediaManagerConfigProvider");
    }
    return config;
}

/**
 * Internal wrapper that reads config from context
 */
function MediaLibraryViewInternal() {
    const config = useMediaManagerConfig();
    const controller = useMediaManagerController({
        storageSource: config.storageSource,
        dataSourceDelegate: config.dataSourceDelegate,
        storagePath: config.storagePath ?? DEFAULT_STORAGE_PATH,
        collectionPath: config.collectionPath ?? DEFAULT_COLLECTION_PATH,
        bucket: config.bucket,
        thumbnailSizes: config.thumbnailSizes,
        thumbnailPath: config.thumbnailPath
    });

    return (
        <MediaManagerProvider controller={controller}>
            <MediaLibraryView
                maxFileSize={config.maxFileSize}
                acceptedMimeTypes={config.acceptedMimeTypes}
            />
        </MediaManagerProvider>
    );
}

/**
 * Build the media view - this is a static object that doesn't change
 */
function buildMediaView(): CMSView {
    return {
        path: "media",
        name: "Media Library",
        description: "Manage your media files",
        group: "Media",
        icon: "perm_media",
        view: <MediaLibraryViewInternal />
    };
}

// Removed static MEDIA_VIEW because it depends on translation

/**
 * Hook to create the Media Manager plugin for FireCMS.
 *
 * The plugin automatically registers the Media Library view in the navigation.
 *
 * @example
 * ```tsx
 * const { plugin: mediaManagerPlugin } = useMediaManagerPlugin({
 *     storageSource,
 *     dataSourceDelegate: firestoreDelegate,
 *     storagePath: "media",
 *     collectionPath: "media_assets"
 * });
 *
 * // Add plugin to your plugins array - view is auto-registered
 * const plugins = [mediaManagerPlugin, ...otherPlugins];
 * ```
 */
export function useMediaManagerPlugin(props: MediaManagerPluginProps): FireCMSPlugin {
    const mediaView = useMemo(() => buildMediaView(), []);

    return useMemo(() => ({
        key: "media_manager",
        views: [mediaView],
        provider: {
            Component: ({ children }: PropsWithChildren) => (
                <MediaManagerConfigContext.Provider value={props}>
                    {children}
                </MediaManagerConfigContext.Provider>
            )
        },
        i18n: {
            en: mediaManagerTranslationsEn,
            es: mediaManagerTranslationsEs,
            de: mediaManagerTranslationsDe,
            fr: mediaManagerTranslationsFr,
            it: mediaManagerTranslationsIt,
            hi: mediaManagerTranslationsHi,
            pt: mediaManagerTranslationsPt
        }
    } satisfies FireCMSPlugin), []);
}
