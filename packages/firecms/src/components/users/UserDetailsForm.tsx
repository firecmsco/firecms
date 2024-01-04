import React, { useCallback } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DoneIcon,
    LoadingButton,
    MultiSelect,
    MultiSelectItem,
    TextField,
    Typography,
    useSnackbarController
} from "@firecms/core";
import { Role } from "@firecms/firebase";

import { FireCMSUserProject } from "../../types/firecms_user";

import { useProjectConfig } from "../../hooks/useProjectConfig";
import { areRolesEqual } from "../../utils/permissions";
import { FieldHelperView } from "../FieldHelperView";
import { useFireCMSBackend } from "../../hooks";
import { useUserManagement } from "../../hooks/useUserManagement";

export const YupSchema = Yup.object().shape({
    displayName: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    roles: Yup.array().min(1)
});

function canUserBeEdited(loggedUser: FireCMSUserProject, user: FireCMSUserProject, users: FireCMSUserProject[], roles: Role[], prevUser?: FireCMSUserProject) {
    const admins = users.filter(u => u.roles.includes("admin"));
    const loggedUserIsAdmin = loggedUser.roles.includes("admin");
    const didRolesChange = !prevUser || !areRolesEqual(prevUser.roles, user.roles);

    if (didRolesChange && !loggedUserIsAdmin) {
        throw new Error("Only admins can change roles");
    }

    // was the admin role removed
    const adminRoleRemoved = prevUser && prevUser.roles.includes("admin") && !user.roles.includes("admin");

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
    user?: FireCMSUserProject,
    handleClose: () => void
}) {

    const snackbarController = useSnackbarController();
    const fireCMSBackend = useFireCMSBackend();
    const {
        saveUser,
        users,
        roles
    } = useUserManagement();
    const isNewUser = !userProp;

    const onUserUpdated = useCallback((savedUser: FireCMSUserProject): Promise<FireCMSUserProject> => {
        const loggedUser = users.find(u => u.uid === fireCMSBackend.user?.uid);
        if (!loggedUser) {
            throw new Error("User not found");
        }
        try {
            canUserBeEdited(loggedUser, savedUser, users, roles, userProp);
            return saveUser(savedUser);
        } catch (e: any) {
            return Promise.reject(e);
        }
    }, [fireCMSBackend.user?.uid, roles, saveUser, userProp, users]);

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open ? handleClose() : undefined}
            maxWidth={"4xl"}
        >
            <Formik
                initialValues={userProp ?? {
                    displayName: "",
                    email: "",
                    roles: ["editor"]
                } as FireCMSUserProject}
                validationSchema={YupSchema}
                onSubmit={(user: FireCMSUserProject, formikHelpers) => {
                    return onUserUpdated(user)
                        .then(() => {
                            handleClose();
                            formikHelpers.resetForm({
                                values: user
                            });
                        }).catch((e) => {
                            snackbarController.open({
                                type: "error",
                                message: e.message
                            });
                        });
                }}
            >
                {({
                      isSubmitting,
                      touched,
                      handleChange,
                      values,
                      errors,
                      setFieldValue,
                      dirty,
                      submitForm,
                      submitCount
                  }) => {
                    return (
                        <Form noValidate style={{
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "100%"
                        }}>
                            <DialogContent className="h-full flex-grow">
                                <div
                                    className="flex flex-row pt-4 pb-4">
                                    <Typography variant={"h4"}
                                                className="flex-grow">
                                        User
                                    </Typography>
                                </div>

                                <div className={"grid grid-cols-12 gap-8"}>

                                    <div className={"col-span-12"}>
                                        <TextField
                                            id="displayName"
                                            required
                                            error={submitCount > 0 && Boolean(errors.displayName)}
                                            value={values.displayName ?? ""}
                                            onChange={handleChange}
                                            aria-describedby="name-helper-text"
                                            label="Name"
                                        />
                                        <FieldHelperView>
                                            {submitCount > 0 && Boolean(errors.displayName) ? errors.displayName : "Name of this user"}
                                        </FieldHelperView>
                                    </div>
                                    <div className={"col-span-12"}>
                                        <TextField
                                            required
                                            error={submitCount > 0 && Boolean(errors.email)}
                                            id="email"
                                            value={values.email ?? ""}
                                            onChange={handleChange}
                                            aria-describedby="email-helper-text"
                                            label="Email"
                                        />
                                        <FieldHelperView>
                                            {submitCount > 0 && Boolean(errors.email) ? errors.email : "Email of this user"}
                                        </FieldHelperView>
                                    </div>
                                    <div className={"col-span-12"}>
                                        <MultiSelect
                                            label="Roles"
                                            value={values.roles ?? []}
                                            onMultiValueChange={(value: string[]) => setFieldValue("roles", value)}
                                            renderValue={(value: string) => {
                                                const userRole = roles
                                                    .find((role) => role.id === value);
                                                return <div className="flex flex-wrap space-x-2 space-y-2">
                                                    <Chip
                                                        colorScheme={"cyanLight"}
                                                        key={userRole?.id}>
                                                        {userRole!.name}
                                                    </Chip>
                                                </div>;
                                            }}>
                                            {roles.map(userRole => <MultiSelectItem key={userRole.id}
                                                                                    value={userRole.id}
                                                                                    // className="flex flex-wrap space-x-2 space-y-2"
                                            >
                                                <Chip
                                                    colorScheme={"cyanLight"}
                                                    key={userRole?.id}>
                                                    {userRole!.name}
                                                </Chip>
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
                                    startIcon={<DoneIcon/>}
                                >
                                    {isNewUser ? "Create user" : "Update"}
                                </LoadingButton>
                            </DialogActions>
                        </Form>
                    );
                }}

            </Formik>
        </Dialog>
    );
}
