import React from "react";
import {
    Box,
    Button,
    Dialog,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Typography
} from "@mui/material";
import { useFormikContext } from "formik";
import { EntitySchema } from "../../../models";
import { CustomDialogActions } from "../CustomDialogActions";

export function SchemaDetailsDialog({
                                        isNewSchema,
                                        open,
                                        handleOk
                                    }: { isNewSchema: boolean, open: boolean, handleOk: () => void }) {
    return (
        <Dialog
            open={open}
            onClose={handleOk}
        >
            <SchemaDetailsView isNewSchema={isNewSchema}/>
            <CustomDialogActions>
                <Button
                    variant="contained"
                    onClick={handleOk}> Ok </Button>
            </CustomDialogActions>
        </Dialog>
    );
}

export function SchemaDetailsView({ isNewSchema }: { isNewSchema: boolean }) {

    const {
        values,
        setFieldValue,
        handleChange,
        touched,
        errors,
        dirty,
        isSubmitting,
        handleSubmit
    } = useFormikContext<EntitySchema>();

    return (
        <Box sx={{
            p: 2
        }}>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant={"h6"}>
                        {"Schema details"}
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth
                                 required
                                 error={touched.name && Boolean(errors.name)}>
                        <InputLabel
                            htmlFor="name">Name</InputLabel>
                        <OutlinedInput
                            id="name"
                            value={values.name}
                            onChange={handleChange}
                            aria-describedby="name-helper-text"
                            label="Name"
                        />
                        <FormHelperText
                            id="name-helper-text">
                            {touched.name && Boolean(errors.name) ? errors.name : "Singular name of this schema (e.g. Product)"}
                        </FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth
                                 required
                                 disabled={!isNewSchema}
                                 error={touched.id && Boolean(errors.id)}>
                        <InputLabel
                            htmlFor="id">Id</InputLabel>
                        <OutlinedInput
                            id="id"
                            value={values.id}
                            onChange={handleChange}
                            aria-describedby="id-helper-text"
                            label="ID"
                        />
                        <FormHelperText
                            id="id-helper-text">
                            {touched.id && Boolean(errors.id) ? errors.id : "Id of this schema (e.g 'product')"}
                        </FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="size-label">
                            Default row size
                        </InputLabel>
                        <Select
                            labelId="size-label"
                            id="defaultSize"
                            name="defaultSize"
                            label="Default row size"
                            onChange={handleChange}
                            value={values.defaultSize}
                            renderValue={(value: any) => value.toUpperCase()}
                        >
                            {["xs", "s", "m", "l", "xl"].map((value) => (
                                <MenuItem
                                    key={`size-select-${value}`} value={value}>
                                    {value.toUpperCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

            </Grid>
        </Box>
    )
}
