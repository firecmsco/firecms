import React from "react";
import { getIn, useFormikContext } from "formik";
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

    const collections = navigation?.collections ?? [];

    const pathPath = multiple ? "of.path" : "path";
    const pathValue: string | undefined = getIn(values, pathPath);

    const groups: string[] = Array.from(new Set(
        Object.values(collections).map(e => e.group).filter(Boolean) as string[]
    ).values());

    const ungroupedCollections = collections.filter((col) => !col.group);

    // const selectViews = [];

    return (
        <>
            <Grid item>
                <FormControl fullWidth
                             disabled={existing}>

                    <InputLabel id="reference-label">Target
                        collection</InputLabel>

                    <Select
                        labelId="reference-label"
                        name={pathPath}
                        value={pathValue ?? ""}
                        onChange={handleChange}
                        label={"Target collection"}
                        disabled={existing}
                        displayEmpty
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
                                                checked={Boolean(pathValue) && (pathValue as string).indexOf(collection.path) > -1}/>
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
                                    checked={Boolean(pathValue) && (pathValue as string).indexOf(collection.path) > -1}/>
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
                <Typography variant={"caption"}>
                    You can only edit the reference collection upon field
                    creation
                </Typography>
            </Grid>

        </>
    );
}
