import {
    ColorChip,
    DeleteConfirmationDialog,
    FireCMSContext,
    useFireCMSContext
} from "@camberi/firecms";

import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { SassUser } from "../../models/sass_user";
import { getUserRoles } from "../../util/permissions";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../utils/dates";
import { useState } from "react";
import { useConfigController } from "../../useConfigController";

export function UsersTable({ onUserClicked }: {
    onUserClicked: (user: SassUser) => void;
}) {

    const { users, roles, deleteUser } = useConfigController();

    const appConfig: FireCMSContext<any> | undefined = useFireCMSContext();
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;

    const [userToBeDeleted, setUserToBeDeleted] = useState<SassUser | undefined>(undefined);
    const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);

    return <Paper
        variant={"outlined"}
        sx={{
            background: "inherit"
        }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ width: 64 }}></TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="center">Roles</TableCell>
                    <TableCell>Created on</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>

                {users && users.map((user) => {

                    const userRoleIds: string[] | undefined = user.roles;
                    if (!userRoleIds) return null;
                    const userRoles = getUserRoles(roles, user);

                    const formattedDate = user.created_on ? format(user.created_on, dateFormat, { locale: dateUtilsLocale }) : "";

                    return (
                        <TableRow
                            key={user.name}
                            onClick={() => {
                                onUserClicked(user);
                            }}
                            hover={true}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell sx={{ width: 64 }}
                                       align="left">
                                <Tooltip title={"Delete this user"}>
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
                            <TableCell
                                component="th"
                                scope="row">
                                {user.id}
                            </TableCell>
                            <TableCell>
                                {user.email}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}
                                       align="left">
                                {user.name}
                            </TableCell>
                            <TableCell
                                align="left">
                                {userRoles ? <Box sx={theme => ({
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: theme.spacing(0.5)
                                })}>
                                    {userRoles.map(userRole => <ColorChip
                                        label={userRole.name}/>)}
                                </Box> : null}
                            </TableCell>
                            <TableCell align="left">
                                {formattedDate}
                            </TableCell>
                        </TableRow>
                    );
                })}
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
                        .finally(() => {
                            setDeleteInProgress(false);
                        })
                }
            }}
            onCancel={() => {
                setUserToBeDeleted(undefined);
            }}
            body={<>Are you sure you want to delete this user?</>}/>
    </Paper>;
}
