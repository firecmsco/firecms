import { useState } from "react";

import { format } from "date-fns";
import * as locales from "date-fns/locale";

import {
    defaultDateFormat,
    ConfirmationDialog, Role,
    useAuthController,
    useCustomizationController, User,
    useSnackbarController
} from "@firecms/core";
import {
    Avatar,
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

            <Table className={"w-full"}>

                <TableHeader>
                    <TableCell className="w-12"></TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Created on</TableCell>
                    <TableCell className="w-12"></TableCell>
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
                                <TableCell className={"w-12"}>
                                    <Avatar
                                        src={user.photoURL ?? undefined}
                                        outerClassName="w-8 h-8 min-w-8 min-h-8 p-0"
                                        className="text-sm"
                                        hover={false}
                                    >
                                        {user.displayName
                                            ? user.displayName[0].toUpperCase()
                                            : (user.email ? user.email[0].toUpperCase() : "U")}
                                    </Avatar>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className={"font-medium align-left"}>{user.displayName}</TableCell>
                                <TableCell className="align-left">
                                    {userRoles
                                        ? <div className="flex flex-wrap gap-2">
                                            {userRoles.map(userRole =>
                                                <RoleChip key={userRole?.id} role={userRole} />
                                            )}
                                        </div>
                                        : null}
                                </TableCell>
                                <TableCell>{formattedDate}</TableCell>
                                <TableCell className={"w-12"}>
                                    <Tooltip
                                        asChild={true}
                                        title={"Delete this user"}>
                                        <IconButton
                                            size={"smallest"}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                return setUserToBeDeleted(user);
                                            }}>
                                            <DeleteIcon size={"small"} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {(!users || users.length === 0) && <TableRow>
                        <TableCell colspan={6}>
                            <CenteredView className={"flex flex-col gap-4 my-8 items-center"}>
                                <Typography variant={"label"}>
                                    There are no users yet
                                </Typography>
                                <Button
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

            <ConfirmationDialog
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
                body={<>Are you sure you want to delete this user?</>} />
        </div>);
}
