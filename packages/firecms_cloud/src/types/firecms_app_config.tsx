import React from "react";
import {
    CMSView,
    CMSViewsBuilder,
    EntityCollection,
    EntityCollectionsBuilder,
    EntityCustomView,
    DefaultAppBarProps,
    Locale,
    ModifyCollectionProps,
    PropertyConfig, EntityAction
} from "@firecms/core";
import { FirebaseApp } from "firebase/app";
import { AppCheckOptions, FirestoreIndexesBuilder, FirestoreTextSearchControllerBuilder } from "@firecms/firebase";

export type FireCMSAppConfig = {

    /**
     * Which federation contract this bundle was built against.
     *
     * - "1": React ^18.x, and `react/jsx-runtime` not shared. Anything in such a
     *   bundle that uses the automatic JSX transform pulled a second copy of
     *   React in with it, and the elements that copy creates have to be
     *   translated before a React 19 host will render them — see
     *   `legacy_elements.ts` in the SaaS app.
     * - "2": React ^19.x, with `react/jsx-runtime` shared, so the bundle carries
     *   no React of its own and needs no translation.
     *
     * Nothing reads this at runtime today; the host bridges "1" bundles
     * unconditionally. It is here so that support can tell at a glance which
     * contract a deployment predates, and so the host can one day skip the
     * compat layer for bundles that declare "2".
     */
    version: "1" | "2";

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[] | EntityCollectionsBuilder;

    /**
     * Use this callback to modify the collection before it is used in the CMS.
     * This is useful to add custom views to the collection without overriding
     * the original collection.
     * @param props
     */
    modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void;

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
     * List of actions that can be performed on entities.
     * These actions are displayed in the entity view and in the collection view.
     * You can later reuse these actions in the `entityActions` prop of a collection,
     * by specifying the `key` of the action.
     */
    entityActions?: EntityAction[];

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
    fireCMSAppBarComponentProps?: Partial<DefaultAppBarProps>;

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
     */
    textSearchControllerBuilder?: FirestoreTextSearchControllerBuilder;

    /**
     * App Check configuration.
     */
    appCheck?: AppCheckOptions;

    /**
     * Pass custom translations to the CMS.
     * You can provide a dictionary of languages and their translation keys.
     */
    translations?: Record<string, Record<string, string>>;

}
