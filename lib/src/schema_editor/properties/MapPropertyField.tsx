import React, { useCallback, useState } from "react";
import { Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PropertyForm } from "../PropertyEditView";
import { MapProperty, Property } from "../../models";
import { getIn, useFormikContext } from "formik";
import { PropertyTree } from "../PropertyTree";
import { getFullId } from "../util";

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

    const selectedPropertyFullId = selectedPropertyId ? getFullId(selectedPropertyId, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    return (
        <>
            <Grid item>
                <Button
                    color="primary"
                    variant={"outlined"}
                    size={"large"}
                    onClick={() => setPropertyDialogOpen(true)}
                    startIcon={<AddIcon/>}
                >
                    Add property to {values.title}
                </Button>
            </Grid>

            <PropertyForm asDialog={true}
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

            <Grid item>
                <PropertyTree
                    properties={values.properties ?? {}}
                    propertiesOrder={values.propertiesOrder}
                    errors={{}}
                    onPropertyClick={(propertyKey, namespace) => {
                        setSelectedPropertyId(propertyKey);
                        setSelectedPropertyNamespace(namespace);
                        setPropertyDialogOpen(true);
                    }}
                    onPropertyMove={() => {
                    }}/>
            </Grid>

        </>);
}
