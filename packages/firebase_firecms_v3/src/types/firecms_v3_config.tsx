import React from "react";
import { FirestoreIndexesBuilder } from "../hooks";
import { CMSView, CMSViewsBuilder, EntityCustomView, FieldConfig, FireCMSAppBarProps } from "firecms";

export type FireCMSCustomization = {

    /**
     * Custom additional views created by the developer, added to the main
     * navigation.
     */
    views?: CMSView[] | CMSViewsBuilder;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `fieldConfig` prop of a property in a collection.
     */
    fields?: Record<string, FieldConfig>;

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
}
