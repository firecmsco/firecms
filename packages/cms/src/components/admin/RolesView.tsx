import React, { useState } from "react";
import { useCollectionRegistryController } from "../../index";
import { useSnackbarController, useTranslation } from "@rebasepro/core";
import { Role, SecurityRule, UserManagementDelegate } from "@rebasepro/types";
import {
    AddIcon,
    Button,
    Chip,
    Container,
    DeleteIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    TextField,
    Typography,
    CircularProgress,
    CenteredView,
    Tooltip,
    Checkbox,
    LoadingButton,
    defaultBorderMixin
} from "@rebasepro/ui";
import { RoleChip } from "./RoleChip";
import { ConfirmationDialog } from "@rebasepro/core";

// ============================================
// RolesView Component
// ============================================
export function RolesView({ userManagement }: { userManagement: UserManagementDelegate }) {
    const { roles, saveRole, deleteRole, loading, allowDefaultRolesCreation } = userManagement;
    const snackbarController = useSnackbarController();
    const { t } = useTranslation();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | undefined>();
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const handleAddRole = () => {
        setSelectedRole(undefined);
        setDialogOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setSelectedRole(undefined);
    };

    const handleDelete = async () => {
        if (!roleToDelete || !deleteRole) return;
        setDeleteInProgress(true);
        try {
            await deleteRole(roleToDelete);
            snackbarController.open({ type: "success", message: t("role_deleted_successfully") });
            setDeleteConfirmOpen(false);
            setRoleToDelete(undefined);
        } catch (error: unknown) {
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : t("error_deleting_role") });
        } finally {
            setDeleteInProgress(false);
        }
    };

    const createDefaultRoles = () => {
        if (!saveRole) return;
        const defaultRoles: Role[] = [
            { id: "admin", name: "Admin", isAdmin: true },
            { id: "editor", name: "Editor", isAdmin: false },
            { id: "viewer", name: "Viewer", isAdmin: false }
        ];
        defaultRoles.forEach(role => saveRole(role));
    };

    if (loading) {
        return <CenteredView><CircularProgress /></CenteredView>;
    }

    return (
        <Container className="w-full flex flex-col py-4 gap-4" maxWidth={"6xl"}>
            <div className="flex items-center mt-12">
                <Typography gutterBottom variant="h4" className="grow" component="h4">
                    {t("roles")}
                </Typography>
                <Button startIcon={<AddIcon />} onClick={handleAddRole} disabled={!saveRole}>
                    {t("add_role")}
                </Button>
            </div>

            <div className="w-full overflow-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableCell header className="w-16"></TableCell>
                        <TableCell header>{t("role")}</TableCell>
                        <TableCell header className="items-center">{t("is_admin")}</TableCell>
                    </TableHeader>
                    <TableBody>
                        {roles && roles.map((role: Role) => {

                            return (
                                <TableRow key={role.id} onClick={() => saveRole && handleEditRole(role)}>
                                    <TableCell style={{ width: "64px" }}>
                                        {!role.isAdmin && deleteRole && (
                                            <Tooltip asChild title={t("delete_this_role")}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRoleToDelete(role);
                                                        setDeleteConfirmOpen(true);
                                                    }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <RoleChip role={role} />
                                    </TableCell>
                                    <TableCell className="items-center">
                                        <Checkbox checked={role.isAdmin ?? false} disabled />
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {(!roles || roles.length === 0) && (
                            <TableRow>
                                <TableCell colspan={4}>
                                    <CenteredView className="flex flex-col gap-4 my-8 items-center">
                                         <Typography variant="label">
                                            {t("no_roles_yet")}
                                        </Typography>
                                        {allowDefaultRolesCreation && saveRole && (
                                            <Button onClick={createDefaultRoles}>
                                                {t("create_default_roles")}
                                            </Button>
                                        )}
                                    </CenteredView>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Role Edit Dialog */}
            {saveRole && (
                <RoleDetailsForm
                    key={selectedRole?.id ?? "new"}
                    open={dialogOpen}
                    role={selectedRole}
                    saveRole={saveRole}
                    handleClose={handleClose}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={deleteConfirmOpen}
                loading={deleteInProgress}
                onAccept={handleDelete}
                onCancel={() => { setDeleteConfirmOpen(false); setRoleToDelete(undefined); }}
                title={<>{t("delete_confirmation_title")}</>}
                body={<>{t("delete_role_confirmation")}</>}
            />
        </Container>
    );
}

// ============================================
// RoleDetailsForm Component
// ============================================
function RoleDetailsForm({
    open,
    role: roleProp,
    saveRole,
    handleClose
}: {
    open: boolean;
    role?: Role;
    saveRole: (role: Role) => Promise<void>;
    handleClose: () => void;
}) {
    const snackbarController = useSnackbarController();
    const { t } = useTranslation();
    const isNewRole = !roleProp;

    const [roleId, setRoleId] = useState(roleProp?.id || "");
    const [roleName, setRoleName] = useState(roleProp?.name || "");
    const [isAdmin, setIsAdmin] = useState(roleProp?.isAdmin ?? false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ id?: string; name?: string }>({});
    const [submitCount, setSubmitCount] = useState(0);

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!roleId) newErrors.id = "Required";
        if (!roleName) newErrors.name = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitCount(c => c + 1);

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await saveRole({
                id: roleId,
                name: roleName,
                isAdmin
            });
            handleClose();
        } catch (error: unknown) {
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : "Failed to save role" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open ? handleClose() : undefined} maxWidth="4xl">
            <form onSubmit={handleSubmit} autoComplete="off" noValidate
                style={{ display: "flex", flexDirection: "column", position: "relative", height: "100%" }}>

                <DialogTitle variant="h4" gutterBottom={false}>
                    {t("role")}
                </DialogTitle>

                <DialogContent className="h-full grow overflow-y-auto">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-4">
                            <TextField
                                name="id"
                                required
                                error={submitCount > 0 && Boolean(errors.id)}
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                label={t("role_id")}
                                disabled={!isNewRole}
                            />
                            {submitCount > 0 && errors.id && (
                                <Typography variant="caption" color="error">{errors.id}</Typography>
                            )}
                        </div>

                        <div className="col-span-12 sm:col-span-4">
                            <TextField
                                name="name"
                                required
                                error={submitCount > 0 && Boolean(errors.name)}
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                label={t("role_name")}
                            />
                            {submitCount > 0 && errors.name && (
                                <Typography variant="caption" color="error">{errors.name}</Typography>
                            )}
                        </div>

                        <div className="col-span-12 sm:col-span-4 flex items-start pt-2">
                            <label className="flex items-center gap-2 cursor-pointer mt-3">
                                <Checkbox
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(Boolean(checked))}
                                />
                                <span className="font-medium">{t("is_admin")}</span>
                            </label>
                        </div>

                        <div className="col-span-12">
                            <CollectionPermissionsMatrix roleId={roleId} isAdmin={isAdmin} />
                        </div>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button variant="text" onClick={handleClose}>
                        {t("cancel")}
                    </Button>
                    <LoadingButton
                        variant="filled"
                        type="submit"
                        disabled={!isNewRole && !isAdmin}
                        loading={isSubmitting}
                    >
                        {isNewRole ? t("create_role") : t("update")}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// ============================================
// CollectionPermissionsMatrix
// ============================================
const CRUD_OPS = [
    { op: "select" as const, label: "read" },
    { op: "insert" as const, label: "create" },
    { op: "update" as const, label: "edit" },
    { op: "delete" as const, label: "delete" },
];

function hasRoleAccess(
    rules: SecurityRule[] | undefined,
    roleId: string,
    op: "select" | "insert" | "update" | "delete"
): boolean {
    if (!rules || rules.length === 0) return true;
    const applicable = rules.filter(r =>
        r.operation === op || r.operation === "all" ||
        r.operations?.includes(op) || r.operations?.includes("all")
    );
    if (applicable.length === 0) return false;
    const forRole = applicable.filter(r =>
        !r.roles || r.roles.length === 0 || r.roles.includes(roleId) || r.roles.includes("public")
    );
    if (forRole.length === 0) return false;
    for (const r of forRole) {
        if ((r.mode ?? "permissive") === "restrictive") return false;
    }
    return forRole.some(r => (r.mode ?? "permissive") === "permissive");
}

function PermCell({ granted }: { granted: boolean }) {
    return (
        <span className={granted
            ? "text-green-500 dark:text-green-400 font-bold"
            : "text-surface-300 dark:text-surface-600"}
        >
            {granted ? "✓" : "✗"}
        </span>
    );
}

function CollectionPermissionsMatrix({ roleId, isAdmin }: { roleId: string; isAdmin: boolean }) {
    const { collections } = useCollectionRegistryController();
    const { t } = useTranslation();

    if (!collections || collections.length === 0) {
        return (
            <div className="mt-4">
                <Typography variant="label" className="text-surface-400">{t("no_collections_configured")}</Typography>
            </div>
        );
    }

    const topLevel = collections;

    return (
        <div className="mt-4">
            <Typography variant="label" className="mb-2 block text-surface-500 dark:text-surface-400 uppercase tracking-wide text-xs">
                {t("collection_permissions")}
            </Typography>
            <div className={`rounded-lg overflow-hidden border w-full ${defaultBorderMixin}`}>
                <Table className="w-full">
                    <TableHeader>
                        <TableCell header>{t("collection")}</TableCell>
                        {CRUD_OPS.map(({ op, label }) => (
                            <TableCell key={op} header align="center" className="w-20">{t(label)}</TableCell>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {topLevel.map((collection) => {
                            const noRules = !collection.securityRules || collection.securityRules.length === 0;
                            return (
                                <TableRow key={collection.slug}>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium">{collection.name}</span>
                                            {noRules && !isAdmin && (
                                                <Tooltip title={t("no_security_rules_defined")}>
                                                    <Chip size="smallest" colorScheme="grayLight">{t("no_rules")}</Chip>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <span className="text-xs text-surface-400 font-mono">{collection.slug}</span>
                                    </TableCell>
                                    {CRUD_OPS.map(({ op }) => (
                                        <TableCell key={op} align="center" className="w-20">
                                            <PermCell granted={isAdmin || hasRoleAccess(collection.securityRules, roleId, op)} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

