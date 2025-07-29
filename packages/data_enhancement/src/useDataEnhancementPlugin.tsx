import React, { useCallback } from "react";

import { EntityCollection, FireCMSPlugin, PluginFieldBuilderParams, useAuthController, User } from "@firecms/core";
import { DataEnhancementControllerProvider } from "./components/DataEnhancementControllerProvider";
import { fieldBuilder } from "./components/field_builder";
import { FormEnhanceAction } from "./components/FormEnhanceAction";
import { SubscriptionMessageProps } from "./types/subscriptions_message_props";

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
        if (!params.slug || !params.collection) return false;
        return getConfigForPath({
            path: params.slug,
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
                    host: props?.host
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
        }
        // loading: configController.loading,
    };
}
