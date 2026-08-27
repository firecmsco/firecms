import React, { useCallback } from "react";

import { EntityCollection, FireCMSPlugin, PluginFieldBuilderParams, useAuthController, User } from "@firecms/core";
import { DataEnhancementControllerProvider } from "./components/DataEnhancementControllerProvider";
import { fieldBuilder } from "./components/field_builder";
import { FormEnhanceAction } from "./components/FormEnhanceAction";
import { SubscriptionMessageProps } from "./types/subscriptions_message_props";
import { dataEnhancementTranslationsEn } from "./locales/en";

const DEFAULT_API_KEY = "fcms-U9jdDii0xXWSDC34asfrf54lbkFJBfKfRWcEDEwdc4V5wDWEDF";

export interface DataEnhancementPluginProps {

    apiKey?: string;

    /**
     * Use this function to determine if the data enhancement plugin should be enabled for a given path.
     * If this function is not provided, the plugin will be enabled for all paths.
     * If the function returns false, the plugin will be disabled for the given path.
     * You can also return a configuration object to override the default configuration.
     *
     * @param path
     * @param collection
     */
    getConfigForPath?: (props: {
        path: string,
        collection: EntityCollection,
        user: User | null
    }) => boolean;

    /**
     * Host to use for the data enhancement API.
     * This prop is only use in development mode.
     */
    host?: string;

    /**
     * Callback for analytics events.
     */
    onAnalyticsEvent?: (event: string, params?: any) => void;
}

/**
 * Use this hook to initialise the data enhancement plugin.
 * This is likely the only hook you will need to use.
 * @param props
 */
export function useDataEnhancementPlugin(props?: DataEnhancementPluginProps): FireCMSPlugin {

    const apiKey = props?.apiKey ?? DEFAULT_API_KEY;
    const getConfigForPath = props?.getConfigForPath;
    const authController = useAuthController();

    const fieldBuilderEnabled = useCallback((params: PluginFieldBuilderParams<any>) => {
        if (!getConfigForPath) return true;
        if (!params.path || !params.collection) return false;
        return getConfigForPath({
            path: params.path,
            collection: params.collection,
            user: authController.user
        })
    }, [getConfigForPath, authController.user?.uid]);

    return {
        key: "data_enhancement",
        form: {
            Actions: FormEnhanceAction,
            provider: {
                Component: DataEnhancementControllerProvider,
                props: {
                    apiKey,
                    getConfigForPath,
                    host: props?.host,
                    onAnalyticsEvent: props?.onAnalyticsEvent
                }
            },
            fieldBuilder,
            fieldBuilderEnabled
        },
        homePage: {
            // CollectionActions: EnhanceCollectionIcon,
            extraProps: {
                getConfigForPath
            }
        },
        i18n: {
        // Only English is bundled; the rest load when that language is selected.
        // Seven languages of strings in every plugin bundle is dead weight for
        // the six nobody is reading.
            en: dataEnhancementTranslationsEn,
            es: () => import("./locales/es").then((m) => m.dataEnhancementTranslationsEs),
            de: () => import("./locales/de").then((m) => m.dataEnhancementTranslationsDe),
            fr: () => import("./locales/fr").then((m) => m.dataEnhancementTranslationsFr),
            it: () => import("./locales/it").then((m) => m.dataEnhancementTranslationsIt),
            hi: () => import("./locales/hi").then((m) => m.dataEnhancementTranslationsHi),
            pt: () => import("./locales/pt").then((m) => m.dataEnhancementTranslationsPt)
        }
        // loading: configController.loading,
    };
}
