import React, { useCallback, useState } from "react";
import { Form, Formik, getIn } from "formik";
import * as Yup from "yup";

import {
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    Paper,
    Table as MuiTable,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import { CustomDialogActions, EntityCollection, } from "@camberi/firecms";
import { LoadingButton } from "@mui/lab";
import { useConfigController } from "../../useConfigController";
import { Role } from "../../models/roles";

export const YupSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
});

export function RolesDetailsForm({
                                     open,
                                     role,
                                     handleClose,
                                     collections
                                 }: {
    open: boolean,
    role?: Role,
    handleClose: () => void,
    collections?: EntityCollection[]
}) {


    const { saveRole, roles } = useConfigController();
    const isNewRole = !Boolean(role);

    const [savingError, setSavingError] = useState<Error | undefined>();

    const onRoleUpdated = useCallback((role: Role) => {
        setSavingError(undefined);
        return saveRole(role);
    }, [saveRole]);

    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            keepMounted={false}
        >
            <Formik
                initialValues={role ?? {
                    name: ""
                } as Role}
                validationSchema={YupSchema}
                onSubmit={(role: Role, formikHelpers) => {
                    console.log("onSubmit", role);
                    return onRoleUpdated(role)
                        .then(() => {
                            formikHelpers.resetForm({
                                values: role
                            });
                            handleClose();
                        })
                        .catch(e => setSavingError(e));
                }}
            >
                {({
                      isSubmitting,
                      touched,
                      values,
                      errors,
                      handleChange,
                      setFieldValue,
                      dirty,
                      submitCount
                  }) => {
                    const isAdmin = values.isAdmin;
                    const defaultCreate = values.defaultPermissions?.create;
                    const defaultRead = values.defaultPermissions?.read;
                    const defaultEdit = values.defaultPermissions?.edit;
                    const defaultDelete = values.defaultPermissions?.delete;
                    return (
                        <Form noValidate style={{
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "100%"
                        }}>
                            <Box sx={{
                                height: "100%",
                                flexGrow: 1
                            }}>
                                <Container maxWidth={"md"}
                                           sx={{
                                               p: 3,
                                               height: "100%",
                                               overflow: "scroll"
                                           }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            pt: 3,
                                            pb: 2
                                        }}>
                                        <Typography variant={"h4"}
                                                    sx={{ flexGrow: 1 }}>
                                            Role
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>

                                        <Grid item xs={12} md={9}>
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
                                                    {touched.name && Boolean(errors.name) ? errors.name : "Name of this role"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isAdmin}
                                                        onChange={handleChange}
                                                        name="isAdmin"/>
                                                }
                                                label="Is admin role"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Paper
                                                variant={"outlined"}
                                                sx={{
                                                    // background: "inherit"
                                                }}>
                                                <MuiTable>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Collection</TableCell>
                                                            <TableCell
                                                                align="center">Create</TableCell>
                                                            <TableCell
                                                                align="center">Read</TableCell>
                                                            <TableCell
                                                                align="center">Update</TableCell>
                                                            <TableCell
                                                                align="center">Delete</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>

                                                        <TableRow
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <TableCell
                                                                component="th"
                                                                scope="row">
                                                                <strong>All
                                                                    collections</strong>
                                                            </TableCell>
                                                            <TableCell
                                                                align="center">
                                                                <Tooltip
                                                                    title="Create entities in collections">
                                                                    <Checkbox
                                                                        disabled={isAdmin}
                                                                        checked={isAdmin || defaultCreate}
                                                                        onChange={(_, checked) => setFieldValue("defaultPermissions.create", checked)}
                                                                        name="defaultPermissions.create"/>
                                                                </Tooltip>
                                                            </TableCell>

                                                            <TableCell
                                                                align="center">
                                                                <Tooltip
                                                                    title="Access all data in every collection">
                                                                    <Checkbox
                                                                        disabled={isAdmin}
                                                                        checked={isAdmin || defaultRead}
                                                                        onChange={(_, checked) => setFieldValue("defaultPermissions.read", checked)}
                                                                        name="defaultPermissions.read"/>
                                                                </Tooltip>
                                                            </TableCell>
                                                            <TableCell
                                                                align="center">
                                                                <Tooltip
                                                                    title="Update data in any collection">
                                                                    <Checkbox
                                                                        disabled={isAdmin}
                                                                        checked={isAdmin || defaultEdit}
                                                                        onChange={(_, checked) => setFieldValue("defaultPermissions.edit", checked)}
                                                                        name="defaultPermissions.edit"/>
                                                                </Tooltip>
                                                            </TableCell>
                                                            <TableCell
                                                                align="center">
                                                                <Tooltip
                                                                    title="Delete data in any collection">
                                                                    <Checkbox
                                                                        disabled={isAdmin}
                                                                        checked={isAdmin || defaultDelete}
                                                                        onChange={(_, checked) => setFieldValue("defaultPermissions.delete", checked)}
                                                                        name="defaultPermissions.delete"/>

                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                        {collections && collections.map((col) => (
                                                            <TableRow
                                                                key={col.name}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell
                                                                    component="th"
                                                                    scope="row">
                                                                    {col.name}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <Checkbox
                                                                        disabled={isAdmin || defaultCreate}
                                                                        checked={isAdmin || defaultCreate || getIn(values, `collectionPermissions.${col.alias ?? col.path}.create`)}
                                                                        onChange={(_, checked) => setFieldValue(`collectionPermissions.${col.alias ?? col.path}.create`, checked)}
                                                                        name={`collectionPermissions.${col.alias ?? col.path}.create`}/>
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <Checkbox
                                                                        disabled={isAdmin || defaultRead}
                                                                        checked={isAdmin || defaultRead || getIn(values, `collectionPermissions.${col.alias ?? col.path}.read`)}
                                                                        onChange={(_, checked) => setFieldValue(`collectionPermissions.${col.alias ?? col.path}.read`, checked)}
                                                                        name={`collectionPermissions.${col.alias ?? col.path}.read`}/>
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <Checkbox
                                                                        disabled={isAdmin || defaultEdit}
                                                                        checked={isAdmin || defaultEdit || getIn(values, `collectionPermissions.${col.alias ?? col.path}.update`)}
                                                                        onChange={(_, checked) => setFieldValue(`collectionPermissions.${col.alias ?? col.path}.update`, checked)}
                                                                        name={`collectionPermissions.${col.alias ?? col.path}.update`}/>
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <Checkbox
                                                                        disabled={isAdmin || defaultDelete}
                                                                        checked={isAdmin || defaultDelete || getIn(values, `collectionPermissions.${col.alias ?? col.path}.delete`)}
                                                                        onChange={(_, checked) => setFieldValue(`collectionPermissions.${col.alias ?? col.path}.delete`, checked)}
                                                                        name={`collectionPermissions.${col.alias ?? col.path}.delete`}/>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </MuiTable>
                                            </Paper>

                                        </Grid>
                                    </Grid>

                                    <Box height={52}/>

                                </Container>
                            </Box>
                            <CustomDialogActions
                                position={"sticky"}>
                                {savingError && <Typography sx={theme => ({
                                    color: theme.palette.error.light
                                })}>
                                    There was an error saving this role
                                </Typography>}
                                <Button variant={"text"}
                                        onClick={() => {
                                            handleClose();
                                        }}>
                                    Cancel
                                </Button>
                                <LoadingButton
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={!dirty}
                                    loading={isSubmitting}
                                    loadingPosition="start"
                                    startIcon={<SaveIcon/>}
                                >
                                    {isNewRole ? "Create role" : "Update"}
                                </LoadingButton>
                            </CustomDialogActions>
                        </Form>
                    );
                }}

            </Formik>
        </Dialog>
    );
}
