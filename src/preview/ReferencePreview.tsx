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
    /**
     * Properties that need to be rendered when as a preview of this reference
     */
    previewProperties?: (keyof S["properties"])[];

}

export default function ReferencePreview<S extends EntitySchema>(
    {
        reference,
        schema,
        previewComponent,
        previewProperties
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

    let listProperties = previewProperties;
    if (!listProperties || !listProperties.length) {
        listProperties = Object.keys(schema.properties).slice(0, 3);
    }


    return (
        <Box display={"flex"}>

            <Box mt={1.5}><LinkIcon color={"disabled"}/></Box>

            <List>
                {listProperties && listProperties.map((key) => {
                    const property = schema.properties[key as string];
                    return (
                        <ListItem key={"ref_prev" + property.title + key}>
                            {entity ?
                                React.createElement(previewComponent, {
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
        </Box>
    );

}
