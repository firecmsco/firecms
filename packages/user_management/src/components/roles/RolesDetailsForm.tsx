import React, { useCallback, useState } from "react";
import * as Yup from "yup";

import { EntityCollection, FieldCaption, Role, toSnakeCase, useAuthController, User, useTranslation
} from "@firecms/core";
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

export const getRoleYupSchema = (t: any) => Yup.object().shape({
    id: Yup.string().required(t("required")),
    name: Yup.string().required(t("required"))
});

function canRoleBeEdited(loggedUser: User, t: any) {
    const loggedUserIsAdmin = loggedUser.roles?.map(r => r.id).includes("admin");
    if (!loggedUserIsAdmin) {
        throw new Error(t("only_admins_edit_roles"));
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
    const { t } = useTranslation();
    const { saveRole } = useUserManagement();
    const isNewRole = !role;
    const {
        user: loggedInUser
    } = useAuthController();

    const [savingError, setSavingError] = useState<Error | undefined>();

    const onRoleUpdated = useCallback((role: Role) => {
        setSavingError(undefined);
        if (!loggedInUser) throw new Error(t("error_user_not_found"));
        canRoleBeEdited(loggedInUser, t);
        return saveRole(role);
    }, [saveRole, loggedInUser, t]);

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
            return getRoleYupSchema(t).validate(values, { abortEarly: false })
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
                    <DialogTitle variant={"h4"} gutterBottom={false}>{t("role")}</DialogTitle>
                    <DialogContent className="flex-grow">

                        <div className={"grid grid-cols-12 gap-4"}>

                            <div className={"col-span-12 md:col-span-8"}>
                                <TextField
                                    name="name"
                                    required
                                    error={touched.name && Boolean(errors.name)}
                                    value={values.name}
                                    disabled={isAdmin || !editable}
                                    onChange={handleChange}
                                    aria-describedby="name-helper-text"
                                    label={t("name")}
                                />
                                <FieldCaption>
                                    {touched.name && Boolean(errors.name) ? errors.name : t("name_of_this_role")}
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
                                    label={t("id")}
                                />
                                <FieldCaption>
                                    {touched.id && Boolean(errors.id) ? errors.id : t("id_of_this_role")}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12"}>
                                <Paper className="bg-inherit overflow-hidden">
                                    <Table className={"w-full rounded-md"}>
                                        <TableHeader className={"rounded-md"}>
                                            <TableCell></TableCell>
                                            <TableCell align="center">{t("create_entities")}</TableCell>
                                            <TableCell align="center">{t("read_entities")}</TableCell>
                                            <TableCell align="center">{t("update_entities")}</TableCell>
                                            <TableCell align="center">{t("delete_entities")}</TableCell>
                                            <TableCell
                                                align="center">
                                            </TableCell>
                                        </TableHeader>

                                        <TableBody>
                                            <TableRow>
                                                <TableCell
                                                    scope="row">
                                                    <strong>{t("all_collections")}</strong>
                                                </TableCell>
                                                <TableCell
                                                    align="center">
                                                    <Tooltip
                                                        title={t("create_entities_in_collections")}>
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
                                                        title={t("access_all_data_in_every_collection")}>
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
                                                        title={t("update_data_in_any_collection")}>
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
                                                        title={t("delete_data_in_any_collection")}>
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
                                                            checked={(isAdmin || defaultCreate || getIn(values, `collectionPermissions.${col.id}.create`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.id}.create`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultRead || !editable}
                                                            checked={(isAdmin || defaultRead || getIn(values, `collectionPermissions.${col.id}.read`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.id}.read`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultEdit || !editable}
                                                            checked={(isAdmin || defaultEdit || getIn(values, `collectionPermissions.${col.id}.edit`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.id}.edit`, checked)}/>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Checkbox
                                                            disabled={isAdmin || defaultDelete || !editable}
                                                            checked={(isAdmin || defaultDelete || getIn(values, `collectionPermissions.${col.id}.delete`)) ?? false}
                                                            onCheckedChange={(checked) => setFieldValue(`collectionPermissions.${col.id}.delete`, checked)}/>
                                                    </TableCell>

                                                    <TableCell
                                                        align="center">
                                                        <Tooltip
                                                            title={t("allow_all_permissions_in_this_collections")}>
                                                            <Button
                                                                className={"color-inherit"}
                                                                onClick={() => {
                                                                    setFieldValue(`collectionPermissions.${col.id}.create`, true);
                                                                    setFieldValue(`collectionPermissions.${col.id}.read`, true);
                                                                    setFieldValue(`collectionPermissions.${col.id}.edit`, true);
                                                                    setFieldValue(`collectionPermissions.${col.id}.delete`, true);
                                                                }}
                                                                disabled={isAdmin || !editable}
                                                                variant={"text"}>
                                                                {t("all")}
                                                                </Button>

                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                                <FieldCaption>
                                    {t("customise_permissions_description")}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    error={touched.config && Boolean(errors.config)}
                                    size={"large"}
                                    fullWidth={true}
                                    id="createCollections"
                                    name="createCollections"
                                    label={t("create_collections")}
                                    position={"item-aligned"}
                                    disabled={isAdmin || !editable}
                                    onChange={(event) => setFieldValue("config.createCollections", event.target.value === "true")}
                                    value={isAdmin || values.config?.createCollections ? "true" : "false"}
                                    renderValue={(value: any) => value === "true" ? t("yes") : t("no")}
                                >
                                    <SelectItem
                                        value={"true"}> {t("yes")} </SelectItem>
                                    <SelectItem
                                        value={"false"}> {t("no")} </SelectItem>
                                </Select>

                                <FieldCaption>
                                    {touched.config && Boolean(errors.config) ? errors.config : t("can_user_create_collections")}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    size={"large"}
                                    fullWidth={true}
                                    error={touched.config && Boolean(errors.config)}
                                    id="editCollections"
                                    name="editCollections"
                                    label={t("edit_collections")}
                                    disabled={isAdmin || !editable}
                                    position={"item-aligned"}
                                    onChange={(event) => setFieldValue("config.editCollections", event.target.value === "own" ? "own" : event.target.value === "true")}
                                    value={isAdmin ? "true" : (values.config?.editCollections === "own" ? "own" : (values.config?.editCollections ? "true" : "false"))}
                                    renderValue={(value: any) => value === "own" ? t("own") : (value === "true" ? t("yes") : t("no"))}
                                >
                                    <SelectItem
                                        value={"true"}> {t("yes")} </SelectItem>
                                    <SelectItem
                                        value={"false"}> {t("no")} </SelectItem>
                                    <SelectItem
                                        value={"own"}> {t("only_own_collections")} </SelectItem>
                                </Select>

                                <FieldCaption>
                                    {touched.config && Boolean(errors.config) ? errors.config : t("can_user_edit_collections")}
                                </FieldCaption>
                            </div>

                            <div className={"col-span-12 md:col-span-4"}>
                                <Select
                                    size={"large"}
                                    fullWidth={true}
                                    error={touched.config && Boolean(errors.config)}
                                    id="deleteCollections"
                                    name="deleteCollections"
                                    label={t("delete_collections")}
                                    disabled={isAdmin || !editable}
                                    position={"item-aligned"}
                                    onChange={(event) => setFieldValue("config.deleteCollections", event.target.value === "own" ? "own" : event.target.value === "true")}
                                    value={isAdmin ? "true" : (values.config?.deleteCollections === "own" ? "own" : (values.config?.deleteCollections ? "true" : "false"))}
                                    renderValue={(value: any) => value === "own" ? t("own") : (value === "true" ? t("yes") : t("no"))}
                                >
                                    <SelectItem
                                        value={"true"}> {t("yes")} </SelectItem>
                                    <SelectItem
                                        value={"false"}> {t("no")} </SelectItem>
                                    <SelectItem
                                        value={"own"}> {t("only_own_collections")} </SelectItem>
                                </Select>

                                <FieldCaption>
                                    {touched.config && Boolean(errors.config) ? errors.config : t("can_user_delete_collections")}
                                </FieldCaption>

                            </div>

                        </div>
                    </DialogContent>

                    <DialogActions position={"sticky"}>
                        {savingError && <Typography className={"text-red-500 dark:text-red-500"}>
                            {savingError.message ?? t("error_saving_role")}
                        </Typography>}
                        <Button variant={"text"}
                                onClick={() => {
                                    handleClose();
                                }}>{t("cancel")}</Button>
                        <LoadingButton
                            variant="filled"
                            type="submit"
                            disabled={!dirty}
                            loading={isSubmitting}
                        >
                            {isNewRole ? t("create_role") : t("update")}
                        </LoadingButton>
                    </DialogActions>
                </form>

            </Formex>
        </Dialog>
    );
}
