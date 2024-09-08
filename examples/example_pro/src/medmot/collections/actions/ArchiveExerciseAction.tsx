import React, { useCallback } from "react";

import { Entity, FireCMSContext, useDataSource } from "@firecms/core";
import { exerciseLocaleCollection, exercisesCollection } from "../exercise_collection";
import { Exercise } from "../exercises";
import { Button, CircularProgress } from "@firecms/ui";

export function ArchiveExerciseAction({
                                          entity,
                                          context
                                      }: { entity: Entity<Exercise>, context: FireCMSContext }) {
    const datasource = useDataSource();
    const [loading, setLoading] = React.useState(false);

    const archiveExercise = useCallback(() => {

        if (!entity) return;
        setLoading(true);

        console.log("Archiving exercise", entity.id);
        datasource
            .fetchCollection({
                path: entity.path + "/" + entity.id + "/locales",
                collection: exerciseLocaleCollection,
            })
            .then(async (localeEntities) => {
                console.log("Locales", localeEntities);
                for (const localeEntity of localeEntities) {
                    await datasource.saveEntity<any>({
                        path: "exercises_archive/" + entity.id + "/locales",
                        entityId: localeEntity.id,
                        values: localeEntity.values,
                        collection: exerciseLocaleCollection,
                        status: "new"
                    });
                }

                await datasource.saveEntity<any>({
                    path: "exercises_archive",
                    entityId: entity.id,
                    values: entity.values,
                    collection: exercisesCollection,
                    status: "new"
                }).then(() => {

                });
                await datasource.deleteEntity({ entity });

                for (const localeEntity of localeEntities) {
                    await datasource.deleteEntity({ entity: localeEntity });
                }

                context.snackbarController.open({
                    type: "success",
                    message: "Archived exercise"
                });
            })
            .catch((error) => {
                console.log(error);
                context.snackbarController.open({
                    type: "error",
                    message: "Error archiving exercise"
                });
            })
            .finally(() => {
                setLoading(false);
            });

    }, [entity]);

    if (!entity) {
        return null;
    }

    return <Button
        variant={"outlined"}
        disabled={loading || entity.values.medico_enabled}
        onClick={archiveExercise}>
        {loading ? <CircularProgress/> : "Archive exercise"}
    </Button>;
}
