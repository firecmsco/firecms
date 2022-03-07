import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Button, Dialog } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import {
    EntitySchema,
    SchemaEditorForm,
    useSnackbarController
} from "../index";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import { SchemaDetailsForm } from "./SchemaDetailsForm";
import { Form, Formik } from "formik";
import { YupSchema } from "./SchemaYupValidation";
import { prepareSchemaForPersistence } from "../core/util/schemas";
import {
    useConfigurationPersistence
} from "../hooks/useConfigurationPersistence";
import { LoadingButton } from "@mui/lab";
import { removeUndefined } from "../core/util/objects";

export interface NewSchemaEditorDialogProps {
    open: boolean;
    handleClose: (schema?: EntitySchema) => void;
}

export function NewSchemaEditorDialog<M>({
                                             open,
                                             handleClose
                                         }: NewSchemaEditorDialogProps) {

    const configurationPersistence = useConfigurationPersistence();
    const snackbarContext = useSnackbarController();

    if (!configurationPersistence)
        throw Error("Can't use the schema editor without specifying a `ConfigurationPersistence`");

    // Use this ref to store which properties have errors
    const propertyErrorsRef = useRef({});

    const [mode, setMode] = useState<"details" | "properties">("details"); // this view can edit either the details view or the properties one

    const [error, setError] = React.useState<Error | undefined>();

    const saveSchema = useCallback((schema: EntitySchema<M>): Promise<boolean> => {
        const newSchema = prepareSchemaForPersistence(schema);
        return configurationPersistence.saveSchema(newSchema)
            .then(() => {
                setError(undefined);
                return true;
            })
            .catch((e) => {
                setError(e);
                console.error(e);
                snackbarContext.open({
                    type: "error",
                    title: "Error persisting schema",
                    message: "Details in the console"
                });
                return false;
            });
    }, [configurationPersistence, snackbarContext]);

    return (
        <Formik
            initialValues={{
                id: "",
                name: "",
                properties: {},
                propertiesOrder: []
            } as EntitySchema}
            validationSchema={YupSchema}
            validate={() => {
                if (mode === "properties") return propertyErrorsRef.current;
                return undefined;
            }}
            onSubmit={(newSchema: EntitySchema, formikHelpers) => {
                console.log("nnn", newSchema);
                return saveSchema(newSchema).then(() => {
                    formikHelpers.resetForm({ values: newSchema });
                    if (mode === "details")
                        setMode("properties")
                    else
                        handleClose(newSchema);
                });
            }}
        >
            {({ isSubmitting, dirty, submitCount }) => {
                return (
                    <Dialog
                        open={open}
                        maxWidth={"lg"}
                        fullWidth
                        PaperProps={{
                            sx: (theme) => ({
                                height: "100vh",
                                background: theme.palette.background.default
                            })
                        }}
                    >
                        <Form noValidate style={{ height: "calc(100% - 64px)" }}>
                            {mode === "details" &&
                                <SchemaDetailsForm isNewSchema={true}/>}

                            {mode === "properties" && <SchemaEditorForm
                                showErrors={submitCount > 0}
                                onPropertyError={(propertyKey, error) => {
                                    propertyErrorsRef.current = removeUndefined({
                                        ...propertyErrorsRef.current,
                                        [propertyKey]: error
                                    })
                                }}/>}

                            <CustomDialogActions position={"absolute"}>
                                <Button variant={"text"}
                                        onClick={() => handleClose()}>
                                    Cancel
                                </Button>
                                <LoadingButton
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={!dirty}
                                    loading={isSubmitting}
                                    loadingPosition="start"
                                    startIcon={<SaveIcon/>}
                                >
                                    Create schema
                                </LoadingButton>
                            </CustomDialogActions>
                        </Form>
                    </Dialog>
                );
            }}

        </Formik>
    );
}
