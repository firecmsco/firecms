import React from "react";
import { FirestoreIndexesBuilder } from "../hooks";
import {
    CMSView,
    CMSViewsBuilder,
    EntityCollectionsBuilder,
    EntityCustomView,
    PropertyConfig,
    FireCMSAppBarProps,
    Locale
} from "@firecms/core";
import { FirebaseApp } from "firebase/app";
import { FirestoreTextSearchController } from "./text_search";
import { FireCMSCollection } from "./collection";

export type FireCMSAppConfig = {

    /**
     * Customization schema version.
     */
    version: "1";

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: FireCMSCollection[] | EntityCollectionsBuilder<FireCMSCollection>;

    /**
     * Custom additional views created by the developer, added to the main
     * navigation.
     */
    views?: CMSView[] | CMSViewsBuilder;

    /**
     * List of custom property configs to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `propertyConfig` prop of a property in a collection.
     */
    propertyConfigs?: PropertyConfig[];

    /**
     * List of additional custom views for entities.
     * You can use the key to reference the custom view in
     * the `entityViews` prop of a collection.
     *
     * You can also define an entity view from the UI.
     */
    entityViews?: EntityCustomView[];

    /**
     * Experimental feature to open the drawer automatically when
     * hovering.
     */
    autoOpenDrawer?: boolean;

    /**
     * Use this component to override the home page.
     */
    HomePage?: React.ComponentType;

    /**
     * Additional props passed to the custom AppBar
     */
    fireCMSAppBarComponentProps?: Partial<FireCMSAppBarProps>;

    /**
     * Use this builder to indicate which indexes are available in your
     * Firestore database. This is used to allow filtering and sorting
     * for multiple fields in the CMS.
     */
    firestoreIndexesBuilder?: FirestoreIndexesBuilder;

    /**
     * Optional callback after Firebase has been initialised. Useful for
     * using the local emulator or retrieving the used configuration.
     * @param config
     */
    onFirebaseInit?: (config: object, app: FirebaseApp) => void;

    // /**
    //  * Use this to enable Firebase App Check
    //  */
    // appCheckOptions?: AppCheckOptions;

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
     * Use this controller to return text search results as document ids, that
     * get then fetched from Firestore.
     *
     */
    textSearchController?: FirestoreTextSearchController;

}
