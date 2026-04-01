import React, { useCallback } from "react";
import * as Yup from "yup";
import {
    Button,
    CheckIcon,
    Chip,
    CopyIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LoadingButton,
    MultiSelect,
    MultiSelectItem,
    TextField,
    Tooltip,
} from "@firecms/ui";
import { FieldCaption, Role, useAuthController, User, useSnackbarController, useTranslation
} from "@firecms/core";
import { Formex, useCreateFormex } from "@firecms/formex";

import { areRolesEqual } from "../../utils";
import { useUserManagement } from "../../hooks";
import { RoleChip } from "../roles";

export const getUserYupSchema = (t: any) => Yup.object().shape({
    displayName: Yup.string().required(t("required")),
    email: Yup.string().email().required(t("required")),
    roles: Yup.array().min(1)
});

function canUserBeEdited(loggedUser: User, user: User, users: User[], roles: Role[], t: any, prevUser?: User) {
    const admins = users.filter(u => u.roles?.map(r => r.id).includes("admin"));
    const loggedUserIsAdmin = loggedUser.roles?.map(r => r.id).includes("admin");
    const didRolesChange = !prevUser || !areRolesEqual(prevUser.roles ?? [], user.roles ?? []);

    if (didRolesChange && !loggedUserIsAdmin) {
        throw new Error(t("only_admins_change_roles"));
    }

    // was the admin role removed
    const adminRoleRemoved = prevUser && prevUser.roles?.map(r => r.id).includes("admin") && !user.roles?.map(r => r.id).includes("admin");

    // avoid removing the last admin
    if (adminRoleRemoved && admins.length === 1) {
        throw new Error(t("must_be_at_least_one_admin"));
    }
    return true;
}

export function UserDetailsForm({
                                    open,
                                    user: userProp,
                                    handleClose
                                }: {
    open: boolean,
    user?: User,
    handleClose: () => void
}) {
    const { t } = useTranslation();
    const snackbarController = useSnackbarController();
    const {
        user: loggedInUser
    } = useAuthController();
    const {
        saveUser,
        users,
        roles,
    } = useUserManagement();
    const isNewUser = !userProp;

    const onUserUpdated = useCallback((savedUser: User): Promise<User> => {
        if (!loggedInUser) {
            throw new Error(t("logged_user_not_found"));
        }
        try {
            canUserBeEdited(loggedInUser, savedUser, users, roles, t, userProp);
            return saveUser(savedUser);
        } catch (e: any) {
            return Promise.reject(e);
        }
    }, [roles, saveUser, userProp, users, loggedInUser, t]);

    const formex = useCreateFormex({
        initialValues: userProp ?? {
            displayName: "",
            email: "",
            roles: roles.filter(r => r.id === "editor")
        } as User,
        validation: (values) => {
            return getUserYupSchema(t).validate(values, { abortEarly: false })
                .then(() => {
                    return {};
                }).catch((e) => {
                    return e.inner.reduce((acc: any, error: any) => {
                        acc[error.path] = error.message;
                        return acc;
                    }, {});
                });
        },
        onSubmit: (user: User, formexController) => {

            return onUserUpdated(user)
                .then(() => {
                    handleClose();
                    formexController.resetForm({
                        values: user
                    });
                }).catch((e) => {
                    snackbarController.open({
                        type: "error",
                        message: e.message
                    });
                });
        }
    });

    const {
        isSubmitting,
        touched,
        handleChange,
        values,
        errors,
        setFieldValue,
        dirty,
        handleSubmit,
        submitCount
    } = formex;

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open ? handleClose() : undefined}
            maxWidth={"4xl"}
        >
            <Formex value={formex}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete={"off"}
                    noValidate
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        height: "100%"
                    }}>

                    <DialogTitle variant={"h4"} gutterBottom={false}>{t("user")}</DialogTitle>
                    <DialogContent className="h-full flex-grow">

                        <div className={"grid grid-cols-12 gap-4"}>

                            {!isNewUser && userProp?.uid && (
                                <div className={"col-span-12"}>
                                    <div className={"flex items-center gap-2"}>
                                        <span className={"text-sm text-surface-accent-600 dark:text-surface-accent-400"}>{t("user_id")}</span>
                                        <Chip size={"small"}>
                                            {userProp.uid}
                                        </Chip>
                                        <Tooltip title={t("copy")}>
                                            <IconButton
                                                size={"small"}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(userProp.uid);
                                                    snackbarController.open({
                                                        type: "success",
                                                        message: t("copied")
                                                    });
                                                }}>
                                                <CopyIcon size={"small"}/>
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            )}

                            <div className={"col-span-12"}>
                                <TextField
                                    name="displayName"
                                    required
                                    error={submitCount > 0 && Boolean(errors.displayName)}
                                    value={values.displayName ?? ""}
                                    onChange={handleChange}
                                    aria-describedby="name-helper-text"
                                    label={t("name")}
                                />
                                <FieldCaption>
                                    {submitCount > 0 && Boolean(errors.displayName) ? errors.displayName : t("name_of_this_user")}
                                </FieldCaption>
                            </div>
                            <div className={"col-span-12"}>
                                <TextField
                                    required
                                    error={submitCount > 0 && Boolean(errors.email)}
                                    name="email"
                                    value={values.email ?? ""}
                                    onChange={handleChange}
                                    aria-describedby="email-helper-text"
                                    label={t("email")}
                                />
                                <FieldCaption>
                                    {submitCount > 0 && Boolean(errors.email) ? errors.email : t("email_of_this_user")}
                                </FieldCaption>
                            </div>
                            <div className={"col-span-12"}>
                                <MultiSelect
                                    className={"w-full"}
                                    label={t("roles")}
                                    value={values.roles?.map(r => r.id) ?? []}
                                    onValueChange={(value: string[]) => setFieldValue("roles", value.map(id => roles.find(r => r.id === id) as Role))}
                                    // renderValue={(value: string) => {
                                    //     const userRole = roles
                                    //         .find((role) => role.id === value);
                                    //     if (!userRole) return null;
                                    //     return <div className="flex flex-wrap space-x-2 space-y-2">
                                    //         <RoleChip key={userRole?.id} role={userRole}/>
                                    //     </div>;
                                    // }}
                                >
                                    {roles.map(userRole => <MultiSelectItem key={userRole.id}
                                                                            value={userRole.id}>
                                        <RoleChip key={userRole?.id} role={userRole}/>
                                    </MultiSelectItem>)}
                                </MultiSelect>
                            </div>

                        </div>

                    </DialogContent>

                    <DialogActions>

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
                            {isNewUser ? t("create_user") : t("update")}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Formex>

        </Dialog>
    );
}
