import * as React from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog
} from "@mui/material";

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
    const [error, setError] = React.useState<Error>();
    const [persisting, setPersisting] = React.useState<boolean>();

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

    const persistSchema = <M extends { [Key: string]: any }>(schema: EntitySchema<M>) => {
        setPersisting(true)
        const newSchema = prepareSchemaForPersistence(schema);
        return configurationPersistence.saveSchema(newSchema)
            .catch((e) => {
                setError(e);
                console.error(e);
                snackbarContext.open({
                    type: "error",
                    title: "Error persisting schema",
                    message: "Details in the console"
                });
            })
            .finally(() => setPersisting(false));
    };

    return <>

        <Box sx={{ p: 2 }}>
            <Container maxWidth={"md"}>
                <SchemaEditor isNewSchema={isNewSchema}
                              schema={schema}
                              onSchemaModified={(schema) => {
                                  setSchema(schema);
                                  if (!isNewSchema)
                                      persistSchema(schema).then();
                              }}/>
            </Container>
        </Box>

        <Box sx={(theme) => ({
            background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
            backdropFilter: "blur(4px)",
            borderTop: `1px solid ${theme.palette.divider}`,
            py: 1,
            px: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "end",
            position: "sticky",
            bottom: 0,
            zIndex: 200,
            textAlign: "right"
        })}
        >

            {persisting && <Box sx={{ px: 3 }}>
                <CircularProgress size={16}
                                  thickness={8}/>
            </Box>}

            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!schema}
                onClick={() => {
                    if (!schema)
                        throw Error("Configuration error in schema editor persistence");
                    if (isNewSchema) {
                        persistSchema(schema).then(() => handleClose ? handleClose(schema) : undefined);
                    } else if (handleClose) {
                        handleClose(schema);
                    }
                }}
            >
                {isNewSchema ? "Create" : "Ok"}
            </Button>

        </Box>
    </>;

}

export interface SchemaEditorDialogProps {
    open: boolean;
    handleClose: (schema: EntitySchema) => void;
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
            onClose={handleClose}
            sx={{
                height: "100vh"
            }}
        >
            <SchemaEditorPersistence schemaId={schemaId}
                                     handleClose={handleClose}/>
        </Dialog>
    );
}
