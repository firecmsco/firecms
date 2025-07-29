import React, { useCallback, useState } from "react";
import * as Yup from "yup";

import { EntityCollection, FieldCaption, Role, toSnakeCase, useAuthController, User, } from "@firecms/core";
import {
    Button,
    Checkbox,
    CheckIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { useUserManagement } from "../../hooks";
import { Formex, getIn, useCreateFormex } from "@firecms/formex";

export const RoleYupSchema = Yup.object().shape({
    id: Yup.string().required("Required"),
    name: Yup.string().required("Required")
});

function canRoleBeEdited(loggedUser: User) {
    const loggedUserIsAdmin = loggedUser.roles?.map(r => r.id).includes("admin");
    if (!loggedUserIsAdmin) {
        throw new Error("Only admins can edit roles");
    }

    return true;
}

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
    const {
        user: loggedInUser
    } = useAuthController();

    const [savingError, setSavingError] = useState<Error | undefined>();

    const onRoleUpdated = useCallback((role: Role) => {
        setSavingError(undefined);
        if (!loggedInUser) throw new Error("User not found");
        canRoleBeEdited(loggedInUser);
        return saveRole(role);
    }, [saveRole, loggedInUser]);

    const formex = useCreateFormex({
        initialValues: role ?? {
            name: ""
        } as Role,
        onSubmit: (role: Role, formexController) => {
            try {
                return onRoleUpdated(role)
                    .then(() => {
                        formexController.resetForm({
                            values: role
                        });
                        handleClose();
                    })
                    .catch(e => {
                        setSavingError(e);
                    });
            } catch (e: any) {
                setSavingError(e);
                return Promise.resolve();
            }
        },
        validation: (values) => {
            return RoleYupSchema.validate(values, { abortEarly: false })
                .then(() => ({}))
                .catch((e) => {
                    const errors: Record<string, string> = {};
                    e.inner.forEach((error: any) => {
                        errors[error.slug] = error.message;
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
                    <DialogTitle variant={"h4"} gutterBottom={false}>
                        Role
                    </DialogTitle>
                    <DialogContent className="grow">

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
                                <FieldCaption>
                                    {touched.name && Boolean(errors.name) ? errors.name : "Name of this role"}
                                </FieldCaption>
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
                                <FieldCaption>
                                    {touched.id && Boolean(errors.id) ? errors.id : "ID of this role"}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12"}>
                                <Paper className="bg-inherit overflow-hidden">
                                    <Table className={"w-full rounded-md"}>
                                        <TableHeader className={"rounded-md"}>
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
                                            <TableCell
                                                align="center">
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
                                                <TableCell
                                                    align="center">
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
                                                            checked={(isAdmin || defaultCreate || getIn(values, `collectionPermissions.${col.slug}.create`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.slug}.create`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultRead || !editable}
                                                            checked={(isAdmin || defaultRead || getIn(values, `collectionPermissions.${col.slug}.read`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.slug}.read`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultEdit || !editable}
                                                            checked={(isAdmin || defaultEdit || getIn(values, `collectionPermissions.${col.slug}.edit`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.slug}.edit`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultDelete || !editable}
                                                            checked={(isAdmin || defaultDelete || getIn(values, `collectionPermissions.${col.slug}.delete`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.slug}.delete`, checked)}/>
                                                    </TableCell>

                                                    <TableCell
                                                        align="center">
                                                        <Tooltip
                                                            title="Allow all permissions in this collections">
                                                            <Button
                                                                className={"color-inherit"}
                                                                onClick={() => {
                                                                    setFieldValue(`collectionPermissions.${col.slug}.create`, true);
                                                                    setFieldValue(`collectionPermissions.${col.slug}.read`, true);
                                                                    setFieldValue(`collectionPermissions.${col.slug}.edit`, true);
                                                                    setFieldValue(`collectionPermissions.${col.slug}.delete`, true);
                                                                }}
                                                                disabled={isAdmin || !editable}
                                                                variant={"text"}>
                                                                All
                                                            </Button>

                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                                <FieldCaption>
                                    You can customise the permissions
                                    that the users related to this
                                    role can perform in the entities
                                    of each collection
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    error={touched.config && Boolean(errors.config)}
                                    size={"large"}
                                    fullWidth={true}
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

                                <FieldCaption>
                                    {touched.config && Boolean(errors.config) ? errors.config : "Can the user create collections"}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    size={"large"}
                                    fullWidth={true}
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

                                <FieldCaption>
                                    {touched.config && Boolean(errors.config) ? errors.config : "Can the user edit collections"}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    size={"large"}
                                    fullWidth={true}
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

                                <FieldCaption>
                                    {touched.config && Boolean(errors.config) ? errors.config : "Can the user delete collections"}
                                </FieldCaption>

                            </div>

                        </div>
                    </DialogContent>

                    <DialogActions position={"sticky"}>
                        {savingError && <Typography className={"text-red-500 dark:text-red-500"}>
                            {savingError.message ?? "There was an error saving this role"}
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
                            startIcon={<CheckIcon/>}
                        >
                            {isNewRole ? "Create role" : "Update"}
                        </LoadingButton>
                    </DialogActions>
                </form>

            </Formex>
        </Dialog>
    );
}
