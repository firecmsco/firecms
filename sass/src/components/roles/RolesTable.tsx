import { useState } from "react";
import {
    DeleteConfirmationDialog,
    FireCMSContext,
    useFireCMSContext
} from "@camberi/firecms";
import { Role } from "../../models/roles";
import {
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../utils/dates";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfigController } from "../../useConfigController";

export function RolesTable({ onRoleClicked }: {
    onRoleClicked: (role: Role) => void;
}) {

    const { roles, deleteRole } = useConfigController();

    const [roleToBeDeleted, setRoleToBeDeleted] = useState<Role | undefined>(undefined);
    const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);
    const appConfig: FireCMSContext<any> | undefined = useFireCMSContext();
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;

    return <Paper
        variant={"outlined"}
        sx={{
            background: "inherit"
        }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ width: 64 }}></TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell
                        align="center">Is Admin</TableCell>
                    <TableCell
                        align="left">Default permissions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>

                {roles && roles.map((role) => {
                    const canCreateAll = role.isAdmin || role.defaultPermissions?.create;
                    const canReadAll = role.isAdmin || role.defaultPermissions?.read;
                    const canUpdateAll = role.isAdmin || role.defaultPermissions?.edit;
                    const canDeleteAll = role.isAdmin || role.defaultPermissions?.delete;
                    return (
                        <TableRow
                            key={role.name}
                            onClick={() => {
                                onRoleClicked(role);
                            }}
                            hover={true}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell sx={{ width: 64 }}
                                       align="left">
                                {!role.isAdmin &&
                                    <Tooltip title={"Delete this role"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                return setRoleToBeDeleted(role);
                                            }}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>}
                            </TableCell>
                            <TableCell
                                component="th"
                                scope="row">
                                {role.name}
                            </TableCell>
                            <TableCell
                                align="center">
                                {role.isAdmin ?
                                    <CheckBoxIcon color={"primary"}/> :
                                    <CheckBoxOutlineBlankIcon/>}
                            </TableCell>
                            <TableCell
                                align="left">
                                <ul>
                                    {canCreateAll && <li>Create</li>}
                                    {canReadAll && <li>Read</li>}
                                    {canUpdateAll && <li>Update</li>}
                                    {canDeleteAll && <li>Delete</li>}
                                </ul>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
        <DeleteConfirmationDialog
            open={Boolean(roleToBeDeleted)}
            loading={deleteInProgress}
            onAccept={() => {
                if (roleToBeDeleted) {
                    setDeleteInProgress(true);
                    deleteRole(roleToBeDeleted)
                        .then(() => {
                            setRoleToBeDeleted(undefined);
                        })
                        .finally(() => {
                            setDeleteInProgress(false);
                        })
                }
            }}
            onCancel={() => {
                setRoleToBeDeleted(undefined);
            }}
            body={<>Are you sure you want to delete this role?</>}/>
    </Paper>;
}
