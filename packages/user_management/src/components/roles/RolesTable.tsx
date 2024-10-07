import { useState } from "react";
import {
    Button,
    CenteredView,
    Checkbox,
    DeleteIcon,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Tooltip,
    Typography
} from "@firecms/ui";
import { ConfirmationDialog, Role } from "@firecms/core";
import { useUserManagement } from "../../hooks";
import { RoleChip } from "./RoleChip";
import { DEFAULT_ROLES } from "./default_roles";

export function RolesTable({
                               onRoleClicked,
                               editable
                           }: {
    onRoleClicked: (role: Role) => void;
    editable: boolean;
}) {

    const {
        roles,
        saveRole,
        deleteRole,
        allowDefaultRolesCreation
    } = useUserManagement();

    const [roleToBeDeleted, setRoleToBeDeleted] = useState<Role | undefined>(undefined);
    const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);

    return <div
        className="w-full overflow-auto">
        <Table className={"w-full"}>
            <TableHeader>
                <TableCell header={true} className="w-16"></TableCell>
                <TableCell header={true}>Role</TableCell>
                <TableCell header={true} className={"items-center"}>Is Admin</TableCell>
                <TableCell header={true}>Default permissions</TableCell>
            </TableHeader>

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
                        >
                            <TableCell style={{ width: "64px" }}>
                                {!role.isAdmin &&
                                    <Tooltip
                                        asChild={true}
                                        title={"Delete this role"}>
                                        <IconButton
                                            size={"small"}
                                            disabled={!editable}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                return setRoleToBeDeleted(role);
                                            }}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>}
                            </TableCell>
                            <TableCell>
                                <RoleChip role={role}/>
                            </TableCell>
                            <TableCell className={"items-center"}>
                                <Checkbox checked={role.isAdmin ?? false}/>
                            </TableCell>
                            <TableCell>
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

                {(!roles || roles.length === 0) && <TableRow>
                    <TableCell colspan={4}>
                        <CenteredView className={"flex flex-col gap-4 my-8 items-center"}>
                            <Typography variant={"label"}>
                                You don&apos;t have any roles yet.
                            </Typography>
                            {allowDefaultRolesCreation && <Button variant={"outlined"}
                                                                  onClick={() => {
                                                                      DEFAULT_ROLES.forEach((role) => {
                                                                          saveRole(role);
                                                                      });
                                                                  }}>
                                Create default roles
                            </Button>}
                        </CenteredView>
                    </TableCell>
                </TableRow>}

            </TableBody>

        </Table>

        <ConfirmationDialog
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
            title={<>Delete?</>}
            body={<>Are you sure you want to delete this role?</>}/>

    </div>;
}
