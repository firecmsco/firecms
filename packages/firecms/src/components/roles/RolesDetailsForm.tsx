import React, { useCallback, useState } from "react";
import * as Yup from "yup";

import { EntityCollection, toSnakeCase, } from "@firecms/core";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DoneIcon,
    LoadingButton,
    Paper,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";
import { FieldHelperView } from "../FieldHelperView";
import { Role } from "@firecms/firebase";
import { useUserManagement } from "../../hooks/useUserManagement";
import { Formex, getIn, useCreateFormex } from "@firecms/formex";

export const YupSchema = Yup.object().shape({
    id: Yup.string().required("Required"),
    name: Yup.string().required("Required")
});

export function RolesDetailsForm({
                                     open,
                                     role,
                                     editable,
                                     handleClose,
                                     collections
                                 }: {
    open: boolean,
    editable?: boolean,
    role?: Role,
    handleClose: () => void,
    collections?: EntityCollection[]
}) {

    const { saveRole } = useUserManagement();
    const isNewRole = !role;

    const [savingError, setSavingError] = useState<Error | undefined>();

    const onRoleUpdated = useCallback((role: Role) => {
        setSavingError(undefined);
        return saveRole(role);
    }, [saveRole]);

    const formex = useCreateFormex({
        initialValues: role ?? {
            name: ""
        } as Role,
        onSubmit: (role: Role, formexController) => {
            return onRoleUpdated(role)
                .then(() => {
                    formexController.resetForm({
                        values: role
                    });
                    handleClose();
                })
                .catch(e => setSavingError(e));
        },
        validation: (values) => {
            return YupSchema.validate(values, { abortEarly: false })
                .then(() => ({}))
                .catch((e) => {
                    const errors: Record<string, string> = {};
                    e.inner.forEach((error: any) => {
                        errors[error.path] = error.message;
                    });
                    return errors;
                });
        }

    });

    const {
        isSubmitting,
        touched,
        values,
        errors,
        handleChange,
        setFieldValue,
        dirty,
        setFieldTouched
    } = formex;

    const isAdmin = values.isAdmin ?? false;
    const defaultCreate = values.defaultPermissions?.create ?? false;
    const defaultRead = values.defaultPermissions?.read ?? false;
    const defaultEdit = values.defaultPermissions?.edit ?? false;
    const defaultDelete = values.defaultPermissions?.delete ?? false;

    console.log({
        values,
        errors,
        touched,
        isAdmin,
        defaultCreate,
        defaultRead,
        defaultEdit,
        defaultDelete
    });

    React.useEffect(() => {
        const idTouched = getIn(touched, "id");
        if (!idTouched && values.name) {
            setFieldValue("id", toSnakeCase(values.name))
        }

    }, [touched, values.name]);

    return (
        <Dialog
            open={open}
            maxWidth={"4xl"}
        >
            <Formex value={formex}>
                <form noValidate
                      autoComplete={"off"}
                      onSubmit={formex.handleSubmit}
                      style={{
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          height: "100%"
                      }}>
                    <DialogContent className="flex-grow">
                        <div
                            className="flex flex-row pt-12 pb-8">
                            <Typography variant={"h4"}
                                        className="flex-grow">
                                Role
                            </Typography>
                        </div>

                        <div className={"grid grid-cols-12 gap-8"}>

                            <div className={"col-span-12 md:col-span-8"}>
                                <TextField
                                    name="name"
                                    required
                                    error={touched.name && Boolean(errors.name)}
                                    value={values.name}
                                    disabled={isAdmin || !editable}
                                    onChange={handleChange}
                                    aria-describedby="name-helper-text"
                                    label="Name"
                                />
                                <FieldHelperView>
                                    {touched.name && Boolean(errors.name) ? errors.name : "Name of this role"}
                                </FieldHelperView>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <TextField
                                    name="id"
                                    required
                                    error={touched.id && Boolean(errors.id)}
                                    value={values.id}
                                    disabled={!isNewRole || !editable}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setFieldTouched("id", true)
                                    }}
                                    aria-describedby="id-helper-text"
                                    label="ID"
                                />
                                <FieldHelperView>
                                    {touched.id && Boolean(errors.id) ? errors.id : "ID of this role"}
                                </FieldHelperView>
                            </div>

                            <div className={"col-span-12"}>
                                <Paper

                                    className="bg-inherit">
                                    <Table>
                                        <TableHeader>
                                            <TableCell></TableCell>
                                            <TableCell
                                                align="center">Create
                                                entities
                                            </TableCell>
                                            <TableCell
                                                align="center">Read
                                                entities
                                            </TableCell>
                                            <TableCell
                                                align="center">Update
                                                entities
                                            </TableCell>
                                            <TableCell
                                                align="center">Delete
                                                entities
                                            </TableCell>
                                        </TableHeader>

                                        <TableBody>
                                            <TableRow>
                                                <TableCell
                                                    scope="row">
                                                    <strong>All
                                                        collections</strong>
                                                </TableCell>
                                                <TableCell
                                                    align="center">
                                                    <Tooltip
                                                        title="Create entities in collections">
                                                        <Checkbox
                                                            disabled={isAdmin || !editable}
                                                            checked={(isAdmin || defaultCreate) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue("defaultPermissions.create", checked)}
                                                        />
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell
                                                    align="center">
                                                    <Tooltip
                                                        title="Access all data in every collection">
                                                        <Checkbox
                                                            disabled={isAdmin || !editable}
                                                            checked={(isAdmin || defaultRead) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue("defaultPermissions.read", checked)}
                                                        />
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell
                                                    align="center">
                                                    <Tooltip
                                                        title="Update data in any collection">
                                                        <Checkbox
                                                            disabled={isAdmin || !editable}
                                                            checked={(isAdmin || defaultEdit) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue("defaultPermissions.edit", checked)}
                                                        />
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell
                                                    align="center">
                                                    <Tooltip
                                                        title="Delete data in any collection">
                                                        <Checkbox
                                                            disabled={isAdmin || !editable}
                                                            checked={(isAdmin || defaultDelete) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue("defaultPermissions.delete", checked)}
                                                        />

                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                            {collections && collections.map((col) => (
                                                <TableRow key={col.name}>
                                                    <TableCell
                                                        scope="row">
                                                        {col.name}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultCreate || !editable}
                                                            checked={(isAdmin || defaultCreate || getIn(values, `collectionPermissions.${col.path}.create`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.path}.create`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultRead || !editable}
                                                            checked={(isAdmin || defaultRead || getIn(values, `collectionPermissions.${col.path}.read`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.path}.read`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultEdit || !editable}
                                                            checked={(isAdmin || defaultEdit || getIn(values, `collectionPermissions.${col.path}.edit`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.path}.edit`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultDelete || !editable}
                                                            checked={(isAdmin || defaultDelete || getIn(values, `collectionPermissions.${col.path}.delete`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.path}.delete`, checked)}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                                <FieldHelperView>
                                    You can customise the permissions
                                    that the users related to this
                                    role can perform in the entities
                                    of each collection
                                </FieldHelperView>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    error={touched.config && Boolean(errors.config)}
                                    id="createCollections"
                                    name="createCollections"
                                    label="Create collections"
                                    position={"item-aligned"}
                                    disabled={isAdmin || !editable}
                                    onChange={(event) => setFieldValue("config.createCollections", event.target.value === "true")}
                                    value={isAdmin || values.config?.createCollections ? "true" : "false"}
                                    renderValue={(value: any) => value === "true" ? "Yes" : "No"}
                                >
                                    <SelectItem
                                        value={"true"}> Yes </SelectItem>
                                    <SelectItem
                                        value={"false"}> No </SelectItem>
                                </Select>

                                <FieldHelperView>
                                    {touched.config && Boolean(errors.config) ? errors.config : "Can the user create collections"}
                                </FieldHelperView>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    error={touched.config && Boolean(errors.config)}
                                    id="editCollections"
                                    name="editCollections"
                                    label="Edit collections"
                                    disabled={isAdmin || !editable}
                                    position={"item-aligned"}
                                    onChange={(event) => setFieldValue("config.editCollections", event.target.value === "own" ? "own" : event.target.value === "true")}
                                    value={isAdmin ? "true" : (values.config?.editCollections === "own" ? "own" : (values.config?.editCollections ? "true" : "false"))}
                                    renderValue={(value: any) => value === "own" ? "Own" : (value === "true" ? "Yes" : "No")}
                                >
                                    <SelectItem
                                        value={"true"}> Yes </SelectItem>
                                    <SelectItem
                                        value={"false"}> No </SelectItem>
                                    <SelectItem
                                        value={"own"}> Only
                                        his/her own </SelectItem>
                                </Select>

                                <FieldHelperView>
                                    {touched.config && Boolean(errors.config) ? errors.config : "Can the user edit collections"}
                                </FieldHelperView>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    error={touched.config && Boolean(errors.config)}
                                    id="deleteCollections"
                                    name="deleteCollections"
                                    label="Delete collections"
                                    disabled={isAdmin || !editable}
                                    position={"item-aligned"}
                                    onChange={(event) => setFieldValue("config.deleteCollections", event.target.value === "own" ? "own" : event.target.value === "true")}
                                    value={isAdmin ? "true" : (values.config?.deleteCollections === "own" ? "own" : (values.config?.deleteCollections ? "true" : "false"))}
                                    renderValue={(value: any) => value === "own" ? "Own" : (value === "true" ? "Yes" : "No")}
                                >
                                    <SelectItem
                                        value={"true"}> Yes </SelectItem>
                                    <SelectItem
                                        value={"false"}> No </SelectItem>
                                    <SelectItem
                                        value={"own"}> Only
                                        his/her own </SelectItem>
                                </Select>

                                <FieldHelperView>
                                    {touched.config && Boolean(errors.config) ? errors.config : "Can the user delete collections"}
                                </FieldHelperView>

                            </div>

                        </div>
                    </DialogContent>

                    <DialogActions position={"sticky"}>
                        {savingError && <Typography className={"text-red-500"}>
                            There was an error saving this role
                        </Typography>}
                        <Button variant={"text"}
                                onClick={() => {
                                    handleClose();
                                }}>
                            Cancel
                        </Button>
                        <LoadingButton
                            variant="filled"
                            color="primary"
                            type="submit"
                            disabled={!dirty}
                            loading={isSubmitting}
                            startIcon={<DoneIcon/>}
                        >
                            {isNewRole ? "Create role" : "Update"}
                        </LoadingButton>
                    </DialogActions>
                </form>

            </Formex>
        </Dialog>
    );
}
