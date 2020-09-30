import * as React from "react";
import { useEffect } from "react";

import { Box, IconButton, List, ListItem, Tooltip } from "@material-ui/core";
import { Entity, EntitySchema } from "../models";

import { listenEntityFromRef } from "../firebase";
import { PreviewComponentProps } from "./PreviewComponentProps";
import SkeletonComponent from "./SkeletonComponent";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { useSelectedEntityContext } from "../selected_entity_controller";

export interface ReferencePreviewProps<S extends EntitySchema> {

    reference: firebase.firestore.DocumentReference;

    schema: S;

    /**
     * Limit the number of preview properties displayed to 3 (if
     * previewProperties is not specified)
     */
    small: boolean;

    previewComponent: React.FunctionComponent<PreviewComponentProps<any>>;

    /**
     * Properties that need to be rendered when as a preview of this reference
     */
    previewProperties?: (keyof S["properties"])[];

}

export default function ReferencePreview<S extends EntitySchema>(
    {
        reference,
        schema,
        small,
        previewComponent,
        previewProperties
    }: ReferencePreviewProps<S>) {

    if (!reference)
        throw Error("Reference previews should be initialized with a value");

    const [entity, setEntity] = React.useState<Entity<S>>();

    const selectedEntityContext = useSelectedEntityContext();

    useEffect(() => {
        const cancel = listenEntityFromRef<S>(reference, schema, (e => {
            setEntity(e);
        }));
        return () => cancel();
    }, [reference, schema]);

    let listProperties = previewProperties;
    if (!listProperties || !listProperties.length) {
        listProperties = Object.keys(schema.properties);
        if (small)
            listProperties = listProperties.slice(0, 3);
    }


    return (
        <Box display={"flex"}>

            <List>
                {listProperties && listProperties.map((key) => {
                    const property = schema.properties[key as string];
                    return (
                        <ListItem key={"ref_prev" + property.title + key}>
                            {entity ?
                                React.createElement(previewComponent, {
                                    name: key as string,
                                    value: entity.values[key as string],
                                    property: property,
                                    small: true
                                })
                                :
                                <SkeletonComponent property={property}
                                                   small={true}/>
                            }
                        </ListItem>
                    );
                })}
            </List>

            <Box>
                <Tooltip title="See details">
                    <IconButton onClick={(e) => {
                        e.stopPropagation();
                        if (entity)
                            selectedEntityContext.open({ entity, schema });
                    }}>
                        <KeyboardTabIcon/>
                    </IconButton>
                </Tooltip>
            </Box>

        </Box>
    );

}
