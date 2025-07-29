import React, { useCallback } from "react";
import * as Yup from "yup";
import {
    Button,
    CheckIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LoadingButton,
    MultiSelect,
    MultiSelectItem,
    TextField,
} from "@firecms/ui";
import { FieldCaption, Role, useAuthController, User, useSnackbarController } from "@firecms/core";
import { Formex, useCreateFormex } from "@firecms/formex";

import { areRolesEqual } from "../../utils";
import { useUserManagement } from "../../hooks";
import { RoleChip } from "../roles";

export const UserYupSchema = Yup.object().shape({
    displayName: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    roles: Yup.array().min(1)
});

function canUserBeEdited(loggedUser: User, user: User, users: User[], roles: Role[], prevUser?: User) {
    const admins = users.filter(u => u.roles?.map(r => r.id).includes("admin"));
    const loggedUserIsAdmin = loggedUser.roles?.map(r => r.id).includes("admin");
    const didRolesChange = !prevUser || !areRolesEqual(prevUser.roles ?? [], user.roles ?? []);

    if (didRolesChange && !loggedUserIsAdmin) {
        throw new Error("Only admins can change roles");
    }

    // was the admin role removed
    const adminRoleRemoved = prevUser && prevUser.roles?.map(r => r.id).includes("admin") && !user.roles?.map(r => r.id).includes("admin");

    // avoid removing the last admin
    if (adminRoleRemoved && admins.length === 1) {
        throw new Error("There must be at least one admin");
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
            throw new Error("Logged user not found");
        }
        try {
            canUserBeEdited(loggedInUser, savedUser, users, roles, userProp);
            return saveUser(savedUser);
        } catch (e: any) {
            return Promise.reject(e);
        }
    }, [roles, saveUser, userProp, users, loggedInUser]);

    const formex = useCreateFormex({
        initialValues: userProp ?? {
            displayName: "",
            email: "",
            roles: roles.filter(r => r.id === "editor")
        } as User,
        validation: (values) => {
            return UserYupSchema.validate(values, { abortEarly: false })
                .then(() => {
                    return {};
                }).catch((e) => {
                    return e.inner.reduce((acc: any, error: any) => {
                        acc[error.slug] = error.message;
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

                    <DialogTitle variant={"h4"} gutterBottom={false}>
                        User
                    </DialogTitle>
                    <DialogContent className="h-full grow">

                        <div className={"grid grid-cols-12 gap-8"}>

                            <div className={"col-span-12"}>
                                <TextField
                                    name="displayName"
                                    required
                                    error={submitCount > 0 && Boolean(errors.displayName)}
                                    value={values.displayName ?? ""}
                                    onChange={handleChange}
                                    aria-describedby="name-helper-text"
                                    label="Name"
                                />
                                <FieldCaption>
                                    {submitCount > 0 && Boolean(errors.displayName) ? errors.displayName : "Name of this user"}
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
                                    label="Email"
                                />
                                <FieldCaption>
                                    {submitCount > 0 && Boolean(errors.email) ? errors.email : "Email of this user"}
                                </FieldCaption>
                            </div>
                            <div className={"col-span-12"}>
                                <MultiSelect
                                    className={"w-full"}
                                    label="Roles"
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
                            {isNewUser ? "Create user" : "Update"}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Formex>

        </Dialog>
    );
}
