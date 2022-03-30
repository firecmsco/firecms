import React from "react";
import { Field, getIn, useFormikContext } from "formik";
import {
    Checkbox,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";

import { NumberProperty, StringProperty } from "../../models";
import { useNavigationContext } from "../../hooks";

export function ReferencePropertyField({
                                           existing,
                                           multiple
                                       }: { existing: boolean, multiple: boolean }) {

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

    console.log("touched", touched, errors);
    return (
        <>
            <Grid item>
                <Field required
                       name={pathPath}
                       type="select"
                       validate={validatePath}
                       disabled={existing}
                       pathPath={pathPath}
                       value={pathValue}
                       error={pathError}
                       handleChange={handleChange}
                       component={CollectionsSelect}/>

                <Typography variant={"caption"}>
                    You can only edit the reference collection upon field
                    creation
                </Typography>

            </Grid>

        </>
    );
}

function validatePath(value: string) {
    let error;
    if (!value) {
        error = "You must specify a targe collection for the field";
    }
    return error;
}


export function CollectionsSelect({
                                      disabled,
                                      pathPath,
                                      value,
                                      handleChange,
                                      error
                                  }: {
    disabled: boolean,
    pathPath: string,
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
                name={pathPath}
                value={value ?? ""}
                onChange={handleChange}
                label={"Target collection"}
                disabled={disabled}
                displayEmpty
                required
                renderValue={(selected) => {
                    return <Typography
                        variant={"subtitle2"}
                        sx={{
                            fontWeight: "500"
                        }}>
                        {collections.find(collection => collection.path === selected)?.name.toUpperCase()}
                    </Typography>
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
                            .map((collection) =>
                                <MenuItem key={collection.path}
                                          value={collection.path}>
                                    <Checkbox
                                        checked={Boolean(value) && (value as string).indexOf(collection.path) > -1}/>
                                    <Typography
                                        variant={"subtitle2"}
                                        sx={{
                                            fontWeight: "500"
                                        }}>
                                        {collection.name.toUpperCase()}
                                    </Typography>
                                </MenuItem>)
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

                {ungroupedCollections.map((collection) =>
                    <MenuItem key={collection.path}
                              value={collection.path}>
                        <Checkbox
                            checked={Boolean(value) && (value as string).indexOf(collection.path) > -1}/>
                        <Typography
                            variant={"subtitle2"}
                            sx={{
                                fontWeight: "500"
                            }}>
                            {collection.name.toUpperCase()}
                        </Typography>
                    </MenuItem>)}

            </Select>
        </FormControl>
    );
}
