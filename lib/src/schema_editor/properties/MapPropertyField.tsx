import React, { useCallback, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PropertyForm } from "../PropertyEditView";
import { MapProperty, Property } from "../../models";
import { getIn, useFormikContext } from "formik";
import { PropertyTree } from "../PropertyTree";
import {
    getFullId,
    idToPropertiesPath,
    namespaceToPropertiesOrderPath,
    namespaceToPropertiesPath
} from "../util";

export function MapPropertyField({}: {}) {

    const {
        values,
        setFieldValue
    } = useFormikContext<MapProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState<boolean>(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();

    const onPropertyCreated = useCallback(({
                                               id,
                                               property
                                           }: { id?: string, property: Property }) => {
        if (!id)
            throw Error();
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("propertiesOrder", [...(values.propertiesOrder ?? Object.keys(values.properties ?? {})), id], false);
        setPropertyDialogOpen(false);
    }, [values.properties, values.propertiesOrder]);

    const deleteProperty = useCallback((propertyId?: string, namespace?: string) => {
        const fullId = propertyId ? getFullId(propertyId, namespace) : undefined;
        if (!fullId)
            throw Error("Schema editor miss config");

        const propertiesPath = idToPropertiesPath(fullId);
        const propertiesOrderPath = namespaceToPropertiesOrderPath(namespace);

        const currentPropertiesOrder: string[] = getIn(values, propertiesOrderPath) ?? Object.keys(getIn(values, namespaceToPropertiesPath(namespace)));

        setFieldValue(propertiesPath, undefined, false);
        setFieldValue(propertiesOrderPath, currentPropertiesOrder.filter((p) => p !== propertyId), false);

        setPropertyDialogOpen(false);
        setSelectedPropertyId(undefined);
        setSelectedPropertyNamespace(undefined);
    }, [setFieldValue, values]);

    const selectedPropertyFullId = selectedPropertyId ? getFullId(selectedPropertyId, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const addChildButton = <Button
        color="primary"
        variant={"outlined"}
        onClick={() => setPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}
    >
        Add property to {values.name ?? "this group"}
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
                        group</Typography>
                    {addChildButton}
                </Box>
                <Paper variant={"outlined"}
                       sx={{ p: 2 }}
                       elevation={0}>

                    <PropertyTree
                        properties={values.properties ?? {}}
                        propertiesOrder={values.propertiesOrder}
                        errors={{}}
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyId(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                            setPropertyDialogOpen(true);
                        }}
                        onPropertyMove={(propertiesOrder: string[], namespace?: string) => {
                            setFieldValue(namespaceToPropertiesOrderPath(namespace), propertiesOrder, false);
                        }}/>

                    {!values.propertiesOrder?.length && <Box sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        Add the first property to this group
                    </Box>}
                </Paper>
            </Grid>

            <PropertyForm asDialog={true}
                          inArray={false}
                          forceShowErrors={false}
                          open={propertyDialogOpen}
                          onCancel={() => {
                              setPropertyDialogOpen(false);
                              setSelectedPropertyId(undefined);
                              setSelectedPropertyNamespace(undefined);
                          }}
                          onOkClicked={() => {
                              setPropertyDialogOpen(false);
                              setSelectedPropertyId(undefined);
                              setSelectedPropertyNamespace(undefined);
                          }}
                          onDelete={deleteProperty}
                          propertyId={selectedPropertyId}
                          propertyNamespace={selectedPropertyNamespace}
                          property={selectedProperty}
                          existing={Boolean(selectedPropertyId)}
                          onPropertyChanged={onPropertyCreated}
                          existingPropertyIds={selectedPropertyId ? undefined : values.propertiesOrder}/>

        </>);
}
