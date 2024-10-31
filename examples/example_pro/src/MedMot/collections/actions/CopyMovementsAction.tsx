import React, { useCallback, useEffect, useState } from "react";

import {
    EntityReference,
    useDataSource,
    Entity,
    FireCMSContext
} from "@firecms/core";

import { jointsCollection } from "../medico_collections";
import { Button } from "@firecms/ui";
import { exerciseJointMovementCollection } from "../exercise_collection";

export function CopyMovementsAction({
                                        entity,
                                        context
                                    }: { entity: Entity<any>, context: FireCMSContext }) {
    const datasource = useDataSource();
    const jointReference: EntityReference = entity.values.joint;
    const [joint, setJoint] = useState<Entity<any> | undefined>();

    useEffect(() => {
        if (jointReference) {
            return datasource.listenEntity!({
                entityId: jointReference.id,
                path: jointReference.path,
                collection: jointsCollection,
                onUpdate: (joinEntity) => {
                    setJoint(joinEntity);
                }
            });
        } else {
            setJoint(undefined);
            return () => {
            };
        }
    }, [jointReference]);

    const copyToMirror = useCallback(() => {
        if (!joint?.values.mirror_joint) return;
        const newJointMovement = {
            joint: joint.values.mirror_joint,
            related_movements: entity.values.related_movements
        };
        datasource.fetchCollection({
            path: entity.path,
            collection: exerciseJointMovementCollection,
            filter: { "joint": ["==", joint.values.mirror_joint] }
        }).then((results) => {
            let id: string | undefined = undefined;
            console.log(results[0]);
            if (results.length) {
                id = results[0].id;
            }
            datasource.saveEntity<any>({
                path: entity.path,
                entityId: id,
                values: newJointMovement,
                collection: exerciseJointMovementCollection,
                status: "copy"
            }).then(() => {
                context.snackbarController.open({
                    type: "success",
                    message: "Copied movements to mirror"
                });
            });
        });
    }, [joint]);

    console.log("joint", joint);
    if (!joint || !joint.values.mirror_joint) {
        return null;
    }

    return <Button onClick={copyToMirror}>Copy to mirror</Button>;
}
