import React, { useCallback, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { ArrayProperty, Property } from "../../models";
import { getIn, useFormikContext } from "formik";
import { PropertyForm } from "../PropertyEditView";
import { getFullId, namespaceToPropertiesOrderPath } from "../util";
import { PropertyTree } from "../PropertyTree";
import AddIcon from "@mui/icons-material/Add";

export function BlockPropertyField({}: {}) {

    const {
        values,
        setFieldValue
    } = useFormikContext<ArrayProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState<boolean>(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
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

    const selectedPropertyFullId = selectedPropertyId ? getFullId(selectedPropertyId, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.oneOf?.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const addChildButton = <Button
        color="primary"
        variant={"outlined"}
        onClick={() => setPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}
    >
        Add property to {values.title ?? "this block"}
    </Button>;
    return (
        <>
            <Grid item>
                <Box display={"flex"}
                     justifyContent={"space-between"}
                     alignItems={"end"}
                     mt={2}
                     mb={1}>
                    <Typography variant={"subtitle2"}>Properties</Typography>
                    {addChildButton}
                </Box>
                <Paper variant={"outlined"}
                       sx={{ p: 2 }}
                       elevation={0}>
                    <PropertyTree
                        properties={values.oneOf?.properties ?? {}}
                        propertiesOrder={values.oneOf?.propertiesOrder}
                        errors={{}}
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyId(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                            setPropertyDialogOpen(true);
                        }}
                        onPropertyMove={(propertiesOrder: string[], namespace?: string) => {
                            setFieldValue(namespaceToPropertiesOrderPath(namespace), propertiesOrder, false);
                        }}/>
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
                          propertyId={selectedPropertyId}
                          propertyNamespace={selectedPropertyNamespace}
                          property={selectedProperty}
                          existing={Boolean(selectedPropertyId)}
                          onPropertyChanged={onPropertyCreated}/>

        </>);
}
