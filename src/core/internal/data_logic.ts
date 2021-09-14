import {
    DataSource,
    Entity,
    EntityOnDeleteProps,
    EntitySchema,
    EntityValues
} from "../../models";
import { SaveEntityProps } from "../../models/datasource";
import { CMSAppContext } from "../../contexts";

export interface SaveEntityInternalProps<M> {
    dataSource: DataSource,
    saveProps: SaveEntityProps<M>,
    context: CMSAppContext,
    onSaveSuccess?: (updatedEntity: Entity<M>) => void,
    onSaveFailure?: (e: Error) => void,
    onPreSaveHookError?: (e: Error) => void,
    onSaveSuccessHookError?: (e: Error) => void
}

export async function saveEntityInternal<M>({
                                                dataSource,
                                                saveProps,
                                                context,
                                                onSaveSuccess,
                                                onSaveFailure,
                                                onPreSaveHookError,
                                                onSaveSuccessHookError
                                            }: SaveEntityInternalProps<M>): Promise<void> {

    const {
        schema,
        path,
        entityId,
        values,
        status
    } = saveProps;

    let updatedValues: Partial<EntityValues<M>>;

    if (schema.onPreSave) {
        try {
            updatedValues = await schema.onPreSave({
                schema,
                path,
                entityId,
                values,
                status,
                context
            });
        } catch (e:any) {
            console.error(e);
            if (onPreSaveHookError)
                onPreSaveHookError(e);
            return;
        }
    } else {
        updatedValues = values;
    }

    return dataSource.saveEntity({
        schema,
        path,
        entityId,
        values: updatedValues,
        status
    }).then((entity) => {
        try {
            if (schema.onSaveSuccess) {
                schema.onSaveSuccess({
                    schema,
                    path,
                    entityId,
                    values: updatedValues,
                    status,
                    context
                });
            }
        } catch (e:any) {
            if (onSaveSuccessHookError)
                onSaveSuccessHookError(e);
        }
        if (onSaveSuccess)
            onSaveSuccess(entity);
    })
        .catch((e) => {
            if (schema.onSaveFailure) {
                schema.onSaveFailure({
                    schema,
                    path,
                    entityId,
                    values: updatedValues,
                    status,
                    context
                });
            }
            if (onSaveFailure) onSaveFailure(e);
        });
}


export interface DeleteEntityInternalProps<M> {
    dataSource: DataSource,
    entity: Entity<M>;
    schema: EntitySchema<M>;
    onDeleteSuccess?: (entity: Entity<M>) => void;
    onDeleteFailure?: (entity: Entity<M>, e: Error) => void;
    onPreDeleteHookError?: (entity: Entity<M>, e: Error) => void;
    onDeleteSuccessHookError?: (entity: Entity<M>, e: Error) => void;
    context: CMSAppContext;
}

export async function deleteEntityInternal<M>({
                                                  dataSource,
                                                  entity,
                                                  schema,
                                                  onDeleteSuccess,
                                                  onDeleteFailure,
                                                  onPreDeleteHookError,
                                                  onDeleteSuccessHookError,
                                                  context
                                              }: DeleteEntityInternalProps<M>): Promise<boolean> {

    console.debug("Deleting entity", entity.path, entity.id);

    const entityDeleteProps: EntityOnDeleteProps<M> = {
        entity,
        schema,
        entityId: entity.id,
        path: entity.path,
        context
    };

    if (schema.onPreDelete) {
        try {
            await schema.onPreDelete(entityDeleteProps);
        } catch (e:any) {
            console.error(e);
            if (onPreDeleteHookError)
                onPreDeleteHookError(entity, e);
            return false;
        }
    }
    return dataSource.deleteEntity({
        entity, schema, context
    }).then(() => {
        onDeleteSuccess && onDeleteSuccess(entity);
        try {
            if (schema.onDelete) {
                schema.onDelete(entityDeleteProps);
            }
            return true;
        } catch (e:any) {
            if (onDeleteSuccessHookError)
                onDeleteSuccessHookError(entity, e);
            return false;
        }
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}
