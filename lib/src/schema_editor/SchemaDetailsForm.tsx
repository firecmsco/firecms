import React, { useEffect } from "react";
import {
    Button,
    Container,
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
import { getIn, useFormikContext } from "formik";
import { EntitySchema } from "../models";
import { toSnakeCase } from "../core/util/strings";


export function SchemaDetailsForm({ isNewSchema }: { isNewSchema: boolean }) {

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

    useEffect(() => {
        const idTouched = getIn(touched, "id");
        if (!idTouched && isNewSchema && values.name) {
            setFieldValue("id", toSnakeCase(values.name))
        }
    }, [isNewSchema, touched, values.name]);

    return (

        <Container maxWidth={"md"} sx={{
            p: 2,
            my: 2
        }}>
            <Grid container spacing={2}>
                <Grid item>
                    {isNewSchema && <Typography variant={"h4"}>
                        {"New schema"}
                    </Typography>}
                    {!isNewSchema && <Typography variant={"h6"}>
                        {"Schema details"}
                    </Typography>}
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
                    <FormControl fullWidth
                                 error={touched.description && Boolean(errors.description)}>
                        <InputLabel
                            htmlFor="description">Description</InputLabel>
                        <OutlinedInput
                            id="description"
                            value={values.description}
                            onChange={handleChange}
                            multiline
                            rows={2}
                            aria-describedby="description-helper-text"
                            label="Description"
                        />
                        <FormHelperText
                            id="description-helper-text">
                            {touched.description && Boolean(errors.description) ? errors.description : "Description of the schema"}
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
        </Container>
    )
}
