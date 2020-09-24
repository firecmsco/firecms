import { Entity, EntitySchema } from "../models";
import React, { useEffect, useState } from "react";
import { listenEntityFromRef } from "../firebase";

import EntityPreview from "../preview/EntityPreview";
import {
    Box,
    Container,
    Drawer,
    IconButton,
    Typography
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

export interface EntityDetailDialogProps<S extends EntitySchema> {
    entity?: Entity<S>,
    schema: S
    open: boolean;
    onClose: () => void;
}

export default function EntityDetailDialog<S extends EntitySchema>(props: EntityDetailDialogProps<S>) {

    const { entity, schema, onClose, open, ...other } = props;

    const [updatedEntity, setUpdatedEntity] = useState<Entity<S> | undefined>(entity);

    useEffect(() => {
        const cancelSubscription =
            entity ?
                listenEntityFromRef<S>(
                    entity?.reference,
                    schema,
                    (e) => {
                        if (e) {
                            setUpdatedEntity(e);
                            console.log("Updated entity from Firestore", e);
                        }
                    })
                :
                () => {
                };
        return () => cancelSubscription();
    }, [entity]);

    return (
        <Drawer
            anchor={"right"}
            variant={"temporary"}
            open={open}
            onClose={onClose}
        >
            <Container maxWidth={"xs"} style={{ maxWidth: "100vw" }}>
                <Box p={1} display="flex" alignItems={"center"}>
                    <IconButton>
                        <CloseIcon onClick={onClose}/>
                    </IconButton>
                    <Box p={3}>
                        <Typography variant={"h6"}>
                            {schema.name}
                        </Typography>
                    </Box>
                </Box>

                {updatedEntity && <EntityPreview
                    entity={updatedEntity}
                    schema={schema}/>
                }

            </Container>
        </Drawer>

    );
}

