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
import { ConfirmationDialog, Role, useTranslation
} from "@firecms/core";
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

    const { t } = useTranslation();
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
                <TableCell header={true}>{t("role")}</TableCell>
                <TableCell header={true} className={"items-center"}>{t("is_admin")}</TableCell>
                <TableCell header={true}>{t("default_permissions")}</TableCell>
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
                                        title={t("delete_this_role")}>
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
                                    {canCreateAll && <li>{t("create")}</li>}
                                    {canReadAll && <li>{t("read")}</li>}
                                    {canUpdateAll && <li>{t("update")}</li>}
                                    {canDeleteAll && <li>{t("delete")}</li>}
                                </ul>
                            </TableCell>
                        </TableRow>
                    );
                })}

                {(!roles || roles.length === 0) && <TableRow>
                    <TableCell colspan={4}>
                        <CenteredView className={"flex flex-col gap-4 my-8 items-center"}>
                            <Typography variant={"label"}>
                                {t("no_roles_yet")}
                            </Typography>
                            {allowDefaultRolesCreation && <Button
                                                                  onClick={() => {
                                                                      DEFAULT_ROLES.forEach((role) => {
                                                                          saveRole(role);
                                                                      });
                                                                  }}>
                                {t("create_default_roles")}
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
            title={<>{t("delete_confirmation_title")}</>}
            body={<>{t("delete_role_confirmation")}</>}/>

    </div>;
}
