import * as React from "react";
import { useEffect } from "react";

import { CircularProgress, List, ListItem } from "@material-ui/core";
import { Entity, EntitySchema } from "../models";
import * as firebase from "firebase";
import { listenEntityFromRef } from "../firebase";
import { PreviewComponentProps } from "./PreviewComponentProps";

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

    if (!entity)
        return (<CircularProgress/>);

    let listProperties = Object.entries(schema.properties).filter(([_, property]) => property.includeAsMapPreview);
    if (!listProperties.length) {
        listProperties = Object.entries(schema.properties).slice(0, 3);
    }

    return (
        <List>
            {listProperties.map(([key, property]) => (
                <ListItem key={"ref_prev" + property.title + key}>
                    {
                        React.createElement(previewComponent, {
                            value: entity.values[key],
                            property: property,
                            small: true
                        })
                    }
                </ListItem>
            ))}
        </List>
    );

}
