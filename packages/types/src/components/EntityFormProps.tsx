import { Entity, EntityCollection, EntityCustomViewParams, EntityStatus, FormContext } from "../types";
import { FormexController } from "./formex";
import { EntityFormActionsProps } from "./EntityFormActionsProps";

export type EntityFormProps<M extends Record<string, any>> = {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string | number;
    entity?: Entity<M>;
    databaseId?: string;
    onIdChange?: (id: string | number) => void;
    onValuesModified?: (modified: boolean) => void;
    onSaved?: (params: OnUpdateParams) => void;
    initialDirtyValues?: Partial<M>; // dirty cached entity in memory
    onFormContextReady?: (formContext: FormContext) => void;
    forceActionsAtTheBottom?: boolean;
    className?: string;
    initialStatus: EntityStatus;
    onStatusChange?: (status: EntityStatus) => void;
    onEntityChange?: (entity: Entity<M>) => void;
    formex?: FormexController<M>;
    openEntityMode?: "side_panel" | "full_screen";
    /**
     * If true, the form will be disabled and no actions will be available
     */
    disabled?: boolean;
    /**
     * Include the copy and delete actions in the form
     */
    showDefaultActions?: boolean;

    /**
     * Display the entity path in the form
     */
    showEntityPath?: boolean;

    EntityFormActionsComponent?: React.FC<EntityFormActionsProps>;

    Builder?: React.ComponentType<EntityCustomViewParams<M>>;

    children?: React.ReactNode;
};

export type OnUpdateParams = {
    entity: Entity<any>,
    status: EntityStatus,
    path: string,
    entityId?: string | number;
    selectedTab?: string;
    collection: EntityCollection<any>
};
