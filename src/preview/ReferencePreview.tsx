import * as React from "react";
import { useEffect } from "react";

import { Box, List, ListItem } from "@material-ui/core";
import { Entity, EntitySchema } from "../models";

import { listenEntityFromRef } from "../firebase";
import { PreviewComponentProps } from "./PreviewComponentProps";
import SkeletonComponent from "./SkeletonComponent";
import LinkIcon from "@material-ui/icons/Link";

export interface ReferencePreviewProps<S extends EntitySchema> {

    reference: firebase.firestore.DocumentReference;

    schema: S;

    previewComponent: React.FunctionComponent<PreviewComponentProps<any>>;

}

export default function ReferencePreview<S extends EntitySchema>(
    {
        reference,
        schema,
        previewComponent
    }: ReferencePreviewProps<S>) {

    if (!reference)
        throw Error("Reference previews should be initialized with a value");

    const [entity, setEntity] = React.useState<Entity<S>>();

    useEffect(() => {
        const cancel = listenEntityFromRef<S>(reference, schema, (e => {
            setEntity(e);
        }));
        return () => cancel();
    }, [reference, schema]);


    let listProperties = Object.entries(schema.properties).filter(([_, property]) => property.includeAsMapPreview);
    if (!listProperties.length) {
        listProperties = Object.entries(schema.properties).slice(0, 3);
    }


    return (
        <Box display={"flex"}>

            <Box mt={1.5}><LinkIcon color={"disabled"}/></Box>

            <List>
                {listProperties.map(([key, property]) => (
                    <ListItem key={"ref_prev" + property.title + key}>
                        {entity ?
                            React.createElement(previewComponent, {
                                value: entity.values[key],
                                property: property,
                                small: true
                            })
                            :
                            <SkeletonComponent property={property}
                                               small={true}/>
                        }
                    </ListItem>
                ))}
            </List>
        </Box>
    );

}
