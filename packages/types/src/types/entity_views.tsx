import React from "react";
import { Entity, EntityValues } from "./entities";
import { EntityCollection } from "./collections";

export type FormContext<M extends Record<string, any> = any> = any;

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
