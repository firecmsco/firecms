import { useState } from "react";

import { format } from "date-fns";
import * as locales from "date-fns/locale";

import {
    defaultDateFormat,
    DeleteConfirmationDialog, Role,
    useAuthController,
    useCustomizationController, User,
    useSnackbarController
} from "@firecms/core";
import {
    Button,
    CenteredView,
    DeleteIcon,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Tooltip,
    Typography,
} from "@firecms/ui";
import { useUserManagement } from "../../hooks";
import { RoleChip } from "../roles";
import { PersistedUser } from "../../types";

export function UsersTable({ onUserClicked }: {
    onUserClicked: (user: User) => void;
}) {

    const {
        users,
        saveUser,
        deleteUser
    } = useUserManagement<PersistedUser>();

    const authController = useAuthController();
    const snackbarController = useSnackbarController();

    const customizationController = useCustomizationController();
    const dateUtilsLocale = customizationController?.locale ? locales[customizationController?.locale as keyof typeof locales] : undefined;
    const dateFormat: string = customizationController?.dateTimeFormat ?? defaultDateFormat;

    const [userToBeDeleted, setUserToBeDeleted] = useState<User | undefined>(undefined);
    const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);

    return (
        <div className="overflow-auto">

            <Table>

                <TableHeader>
                    <TableCell className="truncate w-16"></TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Created on</TableCell>
                </TableHeader>
                <TableBody>
                    {users && users.map((user) => {

                        const userRoles: Role[] | undefined = user.roles;

                        const formattedDate = user.created_on ? format(user.created_on, dateFormat, { locale: dateUtilsLocale }) : "";

                        return (
                            <TableRow
                                key={"row_" + user.uid}
                                onClick={() => {
                                    onUserClicked(user);
                                }}
                            >
                                <TableCell className={"w-10"}>
                                    <Tooltip
                                        asChild={true}
                                        title={"Delete this user"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                return setUserToBeDeleted(user);
                                            }}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{user.uid}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className={"font-medium align-left"}>{user.displayName}</TableCell>
                                <TableCell className="align-left">
                                    {userRoles
                                        ? <div className="flex flex-wrap gap-2">
                                            {userRoles.map(userRole =>
                                                <RoleChip key={userRole?.id} role={userRole}/>
                                            )}
                                        </div>
                                        : null}
                                </TableCell>
                                <TableCell>{formattedDate}</TableCell>
                            </TableRow>
                        );
                    })}

                    {(!users || users.length === 0) && <TableRow>
                        <TableCell colspan={6}>
                            <CenteredView className={"flex flex-col gap-4 my-8 items-center"}>
                                <Typography variant={"label"}>
                                    There are no users yet
                                </Typography>
                                <Button variant={"outlined"}
                                        onClick={() => {
                                            if (!authController.user?.uid) {
                                                throw Error("UsersTable, authController misconfiguration");
                                            }
                                            saveUser({
                                                uid: authController.user?.uid,
                                                email: authController.user?.email,
                                                displayName: authController.user?.displayName,
                                                photoURL: authController.user?.photoURL,
                                                providerId: authController.user?.providerId,
                                                isAnonymous: authController.user?.isAnonymous,
                                                roles: [{ id: "admin", name: "Admin" }],
                                                created_on: new Date()
                                            })
                                                .then(() => {
                                                    snackbarController.open({
                                                        type: "success",
                                                        message: "User added successfully"
                                                    })
                                                })
                                                .catch((error) => {
                                                    snackbarController.open({
                                                        type: "error",
                                                        message: "Error adding user: " + error.message,
                                                    })
                                                });
                                        }}>

                                    Add the logged user as an admin
                                </Button>
                            </CenteredView>
                        </TableCell>
                    </TableRow>}

                </TableBody>
            </Table>

            <DeleteConfirmationDialog
                open={Boolean(userToBeDeleted)}
                loading={deleteInProgress}
                onAccept={() => {
                    if (userToBeDeleted) {
                        setDeleteInProgress(true);
                        deleteUser(userToBeDeleted)
                            .then(() => {
                                setUserToBeDeleted(undefined);
                            })
                            .catch((error) => {
                                snackbarController.open({
                                    type: "error",
                                    message: "Error deleting user: " + error.message,
                                })
                            })
                            .finally(() => {
                                setDeleteInProgress(false);
                            })
                    }
                }}
                onCancel={() => {
                    setUserToBeDeleted(undefined);
                }}
                title={<>Delete?</>}
                body={<>Are you sure you want to delete this user?</>}/>
        </div>);
}
