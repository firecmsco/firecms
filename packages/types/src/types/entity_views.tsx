import React from "react";
import { Entity, EntityValues } from "./entities";
import { EntityCollection } from "./collections";

/**
 * Context passed to custom fields and entity views.
 * This is the base definition — `@rebasepro/cms` re-exports a
 * fully-typed version that narrows the `formex` field.
 * @group Form custom fields
 */
export interface FormContext<M extends Record<string, any> = any> {

    /**
     * Current values of the entity
     */
    values: M;

    /**
     * Update the value of a field
     */
    setFieldValue: (key: string, value: unknown, shouldValidate?: boolean) => void;

    /**
     * Save the entity.
     */
    save: (values: M) => void;

    /**
     * Collection of the entity being modified
     */
    collection?: EntityCollection<M>;

    /**
     * Entity id, it can be undefined if it's a new entity
     */
    entityId?: string | number;

    /**
     * Path this entity is located at
     */
    path?: string;

    status: "new" | "existing" | "copy";

    entity?: Entity<M>;

    savingError?: Error;

    openEntityMode: "side_panel" | "full_screen";

    /**
     * The underlying formex controller that powers the form.
     * Prefer importing `FormContext` from `@rebasepro/cms` for the
     * fully-typed `FormexController<M>` version.
     */
    formex: Record<string, unknown>;

    disabled: boolean;
}


export type EntityCustomView<M extends Record<string, any> = any> = {
    key: string;
    name: string;
    tabComponent?: React.ReactNode;
    includeActions?: boolean | "bottom";
    Builder?: React.ComponentType<EntityCustomViewParams<M>>;
    position?: "start" | "end";
};

export interface EntityCustomViewParams<M extends Record<string, any> = any> {
    collection: EntityCollection<M>;
    entity?: Entity<M>;
    modifiedValues?: EntityValues<M>;
    formContext: FormContext<M>;
    parentCollectionIds?: string[];
}
