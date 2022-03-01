import React, { useCallback, useState } from "react";
import { Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PropertyForm } from "../PropertyEditView";
import { MapProperty, Property } from "../../../../models";
import { useFormikContext } from "formik";

export function MapPropertyField({ existing }: { existing: boolean; }) {

    const {
        values,
        setFieldValue
    } = useFormikContext<MapProperty>();

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
    const onPropertyCreated = useCallback((id: string, property: Property) => {
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("propertiesOrder", [...(values.propertiesOrder ?? []), id], false);
        setNewPropertyDialogOpen(false);
    }, [values.properties, values.propertiesOrder]);

    return (
        <>
            {existing && <Grid item sx={{ mt: 1 }}>
                <Button
                    color="primary"
                    variant={"outlined"}
                    size={"large"}
                    onClick={() => setNewPropertyDialogOpen(true)}
                    startIcon={<AddIcon/>}
                >
                    Add property
                </Button>

                <PropertyForm asDialog={true}
                              forceShowErrors={false}
                              open={newPropertyDialogOpen}
                              onCancel={() => setNewPropertyDialogOpen(false)}
                              onPropertyChanged={onPropertyCreated}/>
            </Grid>}

        </>
    );
}
