import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Box, Button, Dialog } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import {
    EntitySchema,
    SchemaEditorForm,
    useSnackbarController
} from "../index";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import { Form, Formik } from "formik";
import { YupSchema } from "./SchemaYupValidation";
import { prepareSchemaForPersistence } from "../core/util/schemas";
import {
    useConfigurationPersistence
} from "../hooks/useConfigurationPersistence";
import { LoadingButton } from "@mui/lab";
import { removeUndefined } from "../core/util/objects";
import { SchemaDetailsForm } from "./SchemaDetailsForm";

export interface NewSchemaEditorDialogProps {
    open: boolean;
    handleClose: (schema?: EntitySchema) => void;
}

export function NewSchemaEditorDialog<M>({
                                             open,
                                             handleClose
                                         }: NewSchemaEditorDialogProps) {

    const configurationPersistence = useConfigurationPersistence();
    const snackbarController = useSnackbarController();

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
                snackbarController.open({
                    type: "error",
                    title: "Error persisting schema",
                    message: "Details in the console"
                });
                return false;
            });
    }, [configurationPersistence, snackbarController]);

    const initialValues: EntitySchema = {
        id: "",
        name: "",
        properties: {},
        propertiesOrder: []
    };
    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            keepMounted={false}
            PaperProps={{
                sx: (theme) => ({
                    height: "100%",
                    maxHeight: "900px",
                    background: theme.palette.background.default
                })
            }}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={YupSchema}
                validate={() => {
                    if (mode === "properties") return propertyErrorsRef.current;
                    return undefined;
                }}
                onSubmit={(newSchema: EntitySchema, formikHelpers) => {
                    if (mode === "details") {
                        setMode("properties");
                        formikHelpers.resetForm({
                            values: newSchema,
                            touched: { id: true, name: true }
                        });
                    } else {
                        saveSchema(newSchema).then(() => {
                            formikHelpers.resetForm({ values: initialValues });
                            setMode("details");
                            handleClose(newSchema);
                        });
                    }
                }}
            >
                {({ isSubmitting, dirty, submitCount }) => {
                    return (

                        <Form noValidate style={{
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "100%"
                        }}>
                            <Box sx={{
                                height: "100%",
                                flexGrow: 1
                            }}>
                                {mode === "details" &&
                                    <SchemaDetailsForm isNewSchema={true}/>}

                                {mode === "properties" &&
                                    <SchemaEditorForm
                                        showErrors={submitCount > 0}
                                        onPropertyError={(propertyKey, error) => {
                                            propertyErrorsRef.current = removeUndefined({
                                                ...propertyErrorsRef.current,
                                                [propertyKey]: error
                                            })
                                        }}/>
                                }
                            </Box>

                            <CustomDialogActions
                                position={ "sticky" }>
                                <Button variant={"text"}
                                        onClick={() => {
                                            handleClose();
                                            setMode("details");
                                        }}>
                                    Cancel
                                </Button>
                                <LoadingButton
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={!dirty}
                                    loading={isSubmitting}
                                    loadingPosition="start"
                                    startIcon={mode === "properties"
                                        ? <SaveIcon/>
                                        : undefined}
                                >
                                    {mode === "details" ? "Next" : "Create schema"}
                                </LoadingButton>
                            </CustomDialogActions>
                        </Form>
                    );
                }}

            </Formik>
        </Dialog>
    );
}
