import React from "react";
import { Field, getIn, useFormikContext } from "formik";
import {
    Box,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";

import {
    getIconForView,
    NumberProperty,
    StringProperty
} from "@camberi/firecms";
import { useNavigationContext } from "@camberi/firecms";


export function ReferencePropertyField({
                                           existing,
                                           multiple,
                                           disabled
                                       }: { existing: boolean, multiple: boolean, disabled: boolean }) {

    const {
        values,
        handleChange,
        errors,
        touched,
        setFieldError,
        setFieldValue
    } = useFormikContext<StringProperty | NumberProperty>();

    const navigation = useNavigationContext();

    if (!navigation)
        return <Grid item>
            <CircularProgress/>
        </Grid>;

    const pathPath = multiple ? "of.path" : "path";
    const pathValue: string | undefined = getIn(values, pathPath);
    const pathError: string | undefined = getIn(touched, pathPath) && getIn(errors, pathPath);

    return (
        <>
            <Grid item>
                <Field required
                       name={pathPath}
                       type="select"
                       validate={validatePath}
                       disabled={existing || disabled}
                       pathPath={pathPath}
                       value={pathValue}
                       error={pathError}
                       handleChange={handleChange}
                       component={CollectionsSelect}/>

            </Grid>

        </>
    );
}

function validatePath(value: string) {
    let error;
    if (!value) {
        error = "You must specify a target collection for the field";
    }
    return error;
}

export function CollectionsSelect({
                                      disabled,
                                      pathName,
                                      value,
                                      handleChange,
                                      error
                                  }: {
    disabled: boolean,
    pathName: string,
    value?: string,
    handleChange: (event: any) => void,
    error?:string
}) {

    const navigation = useNavigationContext();

    if (!navigation)
        return <Grid item>
            <CircularProgress/>
        </Grid>;

    const collections = navigation?.collections ?? [];

    const groups: string[] = Array.from(new Set(
        Object.values(collections).map(e => e.group).filter(Boolean) as string[]
    ).values());

    const ungroupedCollections = collections.filter((col) => !col.group);

    return (
        <FormControl
            required
            fullWidth
            error={Boolean(error)}
            disabled={disabled}>

            <InputLabel id="reference-label">Target
                collection</InputLabel>

            <Select
                labelId="reference-label"
                name={pathName}
                value={value ?? ""}
                onChange={handleChange}
                label={"Target collection"}
                disabled={disabled}
                displayEmpty
                required
                renderValue={(selected) => {

                    const selectedCollection = collections.find(collection => collection.alias === selected || collection.path === selected);
                    const CollectionIcon = getIconForView(selectedCollection);
                    return (
                        <Box sx={{ display: "flex", flexDirection: "row" }}>
                            <CollectionIcon/>
                            <Typography
                                variant={"subtitle2"}
                                sx={{
                                    fontWeight: "500",
                                    ml: 2
                                }}>
                                {selectedCollection?.name.toUpperCase()}
                            </Typography>
                        </Box>)
                }}>

                {groups.flatMap((group) => (
                    [
                        <Typography variant={"caption"}
                                    color={"textSecondary"}
                                    className={"weight-500"}
                                    sx={{ ml: 2, mt: 1 }}>
                            {group ? group.toUpperCase() : "Ungrouped views".toUpperCase()}
                        </Typography>,
                        collections.filter(collection => collection.group === group)
                            .map((collection) => {
                                const CollectionIcon = getIconForView(collection);
                                return <MenuItem key={collection.alias ?? collection.path}
                                                 value={collection.alias ?? collection.path}>
                                    <CollectionIcon/>
                                    <Typography
                                        variant={"subtitle2"}
                                        sx={{
                                            fontWeight: "500",
                                            mx: 2,
                                            my: 1
                                        }}>
                                        {collection.name.toUpperCase()}
                                    </Typography>
                                </MenuItem>;
                            })
                    ]

                ))}

                {ungroupedCollections && <Typography variant={"caption"}
                                                     color={"textSecondary"}
                                                     className={"weight-500"}
                                                     sx={{
                                                         ml: 2,
                                                         mt: 1
                                                     }}>
                    {"Ungrouped views".toUpperCase()}
                </Typography>}

                {ungroupedCollections.map((collection) => {
                    const CollectionIcon = getIconForView(collection);
                    return <MenuItem key={collection.alias ??collection.path}
                                     value={collection.alias ??collection.path}>
                        <CollectionIcon/>
                        <Typography
                            variant={"subtitle2"}
                            sx={{
                                fontWeight: "500",
                                mx: 2,
                                my: 1
                            }}>
                            {collection.name.toUpperCase()}
                        </Typography>
                    </MenuItem>;
                })}

            </Select>
            <FormHelperText>
                You can only edit the reference collection upon field
                creation.
            </FormHelperText>
        </FormControl>
    );
}
