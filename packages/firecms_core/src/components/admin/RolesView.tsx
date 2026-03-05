import React, { useState } from "react";
import { useSnackbarController } from "../../index";
import { Role, UserManagementDelegate } from "@firecms/types";
import {
    AddIcon,
    Button,
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
    LoadingButton
} from "@firecms/ui";
import { RoleChip } from "./RoleChip";
import { ConfirmationDialog } from "../ConfirmationDialog";

// ============================================
// RolesView Component
// ============================================
export function RolesView({ userManagement }: { userManagement: UserManagementDelegate }) {
    const { roles, saveRole, deleteRole, loading, allowDefaultRolesCreation } = userManagement;
    const snackbarController = useSnackbarController();

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
            snackbarController.open({ type: "success", message: "Role deleted successfully" });
            setDeleteConfirmOpen(false);
            setRoleToDelete(undefined);
        } catch (error: any) {
            snackbarController.open({ type: "error", message: error.message || "Error deleting role" });
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
                    Roles
                </Typography>
                <Button size="large" startIcon={<AddIcon />} onClick={handleAddRole} disabled={!saveRole}>
                    Add role
                </Button>
            </div>

            <div className="w-full overflow-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableCell header className="w-16"></TableCell>
                        <TableCell header>Role</TableCell>
                        <TableCell header className="items-center">Is Admin</TableCell>
                    </TableHeader>
                    <TableBody>
                        {roles && roles.map((role: Role) => {

                            return (
                                <TableRow key={role.id} onClick={() => saveRole && handleEditRole(role)}>
                                    <TableCell style={{ width: "64px" }}>
                                        {!role.isAdmin && deleteRole && (
                                            <Tooltip asChild title="Delete this role">
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
                                            You don't have any roles yet.
                                        </Typography>
                                        {allowDefaultRolesCreation && saveRole && (
                                            <Button onClick={createDefaultRoles}>
                                                Create default roles
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
                title={<>Delete?</>}
                body={<>Are you sure you want to delete this role?</>}
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
        } catch (error: any) {
            snackbarController.open({ type: "error", message: error.message || "Failed to save role" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open ? handleClose() : undefined} maxWidth="4xl">
            <form onSubmit={handleSubmit} autoComplete="off" noValidate
                style={{ display: "flex", flexDirection: "column", position: "relative", height: "100%" }}>

                <DialogTitle variant="h4" gutterBottom={false}>
                    Role
                </DialogTitle>

                <DialogContent className="h-full grow">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <TextField
                                name="id"
                                required
                                error={submitCount > 0 && Boolean(errors.id)}
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                label="Role ID"
                                disabled={!isNewRole}
                            />
                            {submitCount > 0 && errors.id && (
                                <Typography variant="caption" color="error">{errors.id}</Typography>
                            )}
                        </div>

                        <div className="col-span-12">
                            <TextField
                                name="name"
                                required
                                error={submitCount > 0 && Boolean(errors.name)}
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                label="Role Name"
                            />
                            {submitCount > 0 && errors.name && (
                                <Typography variant="caption" color="error">{errors.name}</Typography>
                            )}
                        </div>

                        <div className="col-span-12">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(Boolean(checked))}
                                />
                                <span className="font-medium">Is Admin</span>
                            </label>
                            <Typography variant="caption">
                                Admins have full access to all collections
                            </Typography>
                        </div>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button variant="text" onClick={handleClose}>
                        Cancel
                    </Button>
                    <LoadingButton
                        variant="filled"
                        type="submit"
                        disabled={!isNewRole && !isAdmin}
                        loading={isSubmitting}
                    >
                        {isNewRole ? "Create role" : "Update"}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
