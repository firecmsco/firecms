import React from "react";
import { EntityAction, EntityCustomView, EntityLinkBuilder, FireCMSPlugin, Locale, PropertyConfig } from "../types";

export type CustomizationController = {

    /**
     * Builder for generating utility links for entities
     */
    entityLinkBuilder?: EntityLinkBuilder;

    /**
     * Use plugins to modify the behaviour of the CMS.
     */
    plugins?: FireCMSPlugin<any, any, any>[];

    /**
     * List of additional custom views for entities.
     * You can use the key to reference the custom view in
     * the `entityViews` prop of a collection.
     *
     * You can also define an entity view from the UI.
     */
    entityViews?: EntityCustomView[];

    /**
     * List of actions that can be performed on entities.
     * These actions are displayed in the entity view and in the collection view.
     * You can later reuse these actions in the `entityActions` prop of a collection,
     * by specifying the `key` of the action.
     */
    entityActions?: EntityAction<any, any>[];

    /**
     * Format of the dates in the CMS.
     * Defaults to 'MMMM dd, yyyy, HH:mm:ss'
     */
    dateTimeFormat?: string;

    /**
     * Locale of the CMS, currently only affecting dates
     */
    locale?: Locale;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `propertyConfig` prop of a property in a collection.
     */
    propertyConfigs: Record<string, PropertyConfig>;

    components?: {

        /**
         * Component to render when a reference is missing
         */
        missingReference?: React.ComponentType<{
            path: string,
        }>;

    };
}
