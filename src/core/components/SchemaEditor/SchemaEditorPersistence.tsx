import * as React from "react";
import { Dialog } from "@mui/material";

import { SchemaEditor } from "./SchemaEditor";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { EntitySchema, ErrorView, useSnackbarController } from "../../..";
import { useConfigurationPersistence } from "../../../hooks/useConfigurationPersistence";
import { useSchemaRegistry } from "../../../hooks/useSchemaRegistry";
import { prepareSchemaForPersistence } from "../../util/schemas";

export type SchemaEditorProps = {
    schemaId?: string;
    handleClose?: (schema: EntitySchema) => void;
};

export function SchemaEditorPersistence({
                                            schemaId,
                                            handleClose
                                        }: SchemaEditorProps) {

    const isNewSchema = !schemaId;
    const schemaRegistry = useSchemaRegistry();

    const configurationPersistence = useConfigurationPersistence();
    if (!configurationPersistence)
        throw Error("Can't use the schema editor without specifying a `ConfigurationPersistence`");

    const [schema, setSchema] = React.useState<EntitySchema | undefined>();
    const [error, setError] = React.useState<Error | undefined>();
    const [saving, setSaving] = React.useState<boolean>();

    const snackbarContext = useSnackbarController();

    React.useEffect(() => {
        try {
            if (schemaRegistry.initialised) {
                if (schemaId) {
                    setSchema(schemaRegistry.findSchema(schemaId));
                } else {
                    setSchema(undefined);
                }
            }
        } catch (e) {
            setError(error);
        }
    }, [schemaId, schemaRegistry]);

    if (error) {
        return <ErrorView error={`Error fetching schema ${schemaId}`}/>;
    }

    if (!schemaRegistry.initialised || !(isNewSchema || schema)) {
        return <CircularProgressCenter/>;
    }

    const saveSchema = <M, >(schema: EntitySchema<M>) => {
        console.log("save", schema);
        setSaving(true)
        const newSchema = prepareSchemaForPersistence(schema);
        return configurationPersistence.saveSchema(newSchema)
            .then(() => {
                console.log("save then", schema);
                setError(undefined);
                snackbarContext.open({
                    type: "success",
                    message: "Schema updated"
                });
                if (handleClose) {
                    handleClose(schema);
                }
            })
            .catch((e) => {
                setError(e);
                console.error(e);
                snackbarContext.open({
                    type: "error",
                    title: "Error persisting schema",
                    message: "Details in the console"
                });
            })
            .finally(() => setSaving(false));
    };

    console.log("schema", schema);

    return <SchemaEditor initialSchema={schema}
                         loading={saving ?? false}
                         onSave={saveSchema}/>;

}

export interface SchemaEditorDialogProps {
    open: boolean;
    handleClose: (schema?: EntitySchema) => void;
    schemaId?: string;
}

export function SchemaEditorDialog({
                                       open,
                                       handleClose,
                                       schemaId
                                   }: SchemaEditorDialogProps) {

    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            onClose={() => handleClose(undefined)}
            sx={{
                height: "100vh"
            }}
        >
            <SchemaEditorPersistence schemaId={schemaId}
                                     handleClose={handleClose}/>
        </Dialog>
    );
}
