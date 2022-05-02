import React, { useCallback, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { ArrayProperty, Property } from "@camberi/firecms";
import { getIn, useFormikContext } from "formik";
import { PropertyForm } from "../PropertyEditView";
import {
    getFullId,
    idToPropertiesPath,
    namespaceToPropertiesOrderPath
} from "../util";
import { PropertyTree } from "../PropertyTree";
import AddIcon from "@mui/icons-material/Add";

export function BlockPropertyField({ disabled }: {
    disabled: boolean;
}) {

    const {
        values,
        setFieldValue
    } = useFormikContext<ArrayProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState<boolean>(false);
    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();

    const onPropertyCreated = useCallback(({
                                               id,
                                               property
                                           }: { id?: string, property: Property }) => {
        if (!id)
            throw Error();
        setFieldValue("oneOf.properties", {
            ...(values.oneOf?.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("oneOf.propertiesOrder", [...(values.oneOf?.propertiesOrder ?? Object.keys(values.oneOf?.properties ?? {})), id], false);
        setPropertyDialogOpen(false);
    }, [values.oneOf?.properties, values.oneOf?.propertiesOrder]);

    const selectedPropertyFullId = selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.oneOf?.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const deleteProperty = useCallback((propertyKey?: string, namespace?: string) => {
        const fullId = propertyKey ? getFullId(propertyKey, namespace) : undefined;
        if (!fullId)
            throw Error("collection editor miss config");

        setFieldValue(`oneOf.${idToPropertiesPath(fullId)}`, undefined, false);
        const propertiesOrderPath = `oneOf.${namespaceToPropertiesOrderPath(namespace)}`;
        const currentPropertiesOrder: string[] = getIn(values, propertiesOrderPath);
        setFieldValue(propertiesOrderPath, currentPropertiesOrder.filter((p) => p !== propertyKey), false);

        setPropertyDialogOpen(false);
        setSelectedPropertyKey(undefined);
        setSelectedPropertyNamespace(undefined);
    }, [setFieldValue, values]);

    const addChildButton = <Button
        autoFocus
        color="primary"
        variant={"outlined"}
        onClick={() => setPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}
    >
        Add property to {values.name ?? "this block"}
    </Button>;
    return (
        <>
            <Grid item>
                <Box display={"flex"}
                     justifyContent={"space-between"}
                     alignItems={"end"}
                     mt={2}
                     mb={1}>
                    <Typography variant={"subtitle2"}>Properties in this
                        block</Typography>
                    {addChildButton}
                </Box>
                <Paper variant={"outlined"}
                       sx={{ p: 2 }}
                       elevation={0}>

                    <PropertyTree
                        properties={values.oneOf?.properties ?? {}}
                        propertiesOrder={values.oneOf?.propertiesOrder}
                        errors={{}}
                        onPropertyClick={disabled ? undefined : (propertyKey, namespace) => {
                            setSelectedPropertyKey(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                            setPropertyDialogOpen(true);
                        }}
                        onPropertyMove={disabled ? undefined : (propertiesOrder: string[], namespace?: string) => {
                            setFieldValue(`oneOf.${namespaceToPropertiesOrderPath(namespace)}`, propertiesOrder, false);
                        }}/>

                    {!disabled && !values.oneOf?.propertiesOrder?.length && <Box sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        Add the first property to this block
                    </Box>}

                </Paper>
            </Grid>

            {!disabled && <PropertyForm asDialog={true}
                                        inArray={false}
                                        forceShowErrors={false}
                                        open={propertyDialogOpen}
                                        onCancel={() => {
                                            setPropertyDialogOpen(false);
                                            setSelectedPropertyKey(undefined);
                                            setSelectedPropertyNamespace(undefined);
                                        }}
                                        onOkClicked={() => {
                                            setPropertyDialogOpen(false);
                                            setSelectedPropertyKey(undefined);
                                            setSelectedPropertyNamespace(undefined);
                                        }}
                                        onDelete={deleteProperty}
                                        propertyKey={selectedPropertyKey}
                                        propertyNamespace={selectedPropertyNamespace}
                                        property={selectedProperty}
                                        existing={Boolean(selectedPropertyKey)}
                                        onPropertyChanged={onPropertyCreated}
                                        existingPropertyKeys={selectedPropertyKey ? undefined : values.oneOf?.propertiesOrder}/>}

        </>);
}
