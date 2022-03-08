import React, { useCallback, useState } from "react";
import { Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PropertyForm } from "../PropertyEditView";
import { MapProperty, Property } from "../../models";
import { useFormikContext } from "formik";

export function MapPropertyFieldAdvanced({ existing }: { existing: boolean; }) {

    const {
        values,
        setFieldValue
    } = useFormikContext<MapProperty>();

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
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
        setNewPropertyDialogOpen(false);
    }, [values.properties, values.propertiesOrder]);

    return (
        <>
            {existing && <Grid item>
                <Button
                    color="primary"
                    variant={"outlined"}
                    size={"large"}
                    onClick={() => setNewPropertyDialogOpen(true)}
                    startIcon={<AddIcon/>}
                >
                    Add property to {values.title}
                </Button>

                <PropertyForm asDialog={true}
                              forceShowErrors={false}
                              open={newPropertyDialogOpen}
                              onCancel={() => setNewPropertyDialogOpen(false)}
                              existing={false}
                              onPropertyChanged={onPropertyCreated}/>
            </Grid>}

        </>
    );
}
