import React, { useState } from "react";
import { User, useSnackbarController, useAuthController } from "../../index";
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
    MultiSelect,
    MultiSelectItem,
    LoadingButton
} from "@firecms/ui";
import { RoleChip } from "./RoleChip";
import { UserManagementDelegate, Role } from "@firecms/types";
import { ConfirmationDialog } from "../ConfirmationDialog";

// ============================================
// UsersView Component
// ============================================
export function UsersView({ userManagement }: {
    userManagement: UserManagementDelegate;
}) {
    const { users, roles, saveUser, deleteUser, loading, bootstrapAdmin } = userManagement;
    const snackbarController = useSnackbarController();
    const { user: loggedInUser } = useAuthController();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | undefined>();
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [bootstrapping, setBootstrapping] = useState(false);

    // Check if any admin exists
    const hasAdmin = users.some(u => u.roles?.some(r => r.id === "admin"));

    const handleBootstrap = async () => {
        if (!bootstrapAdmin) return;
        setBootstrapping(true);
        try {
            await bootstrapAdmin();
            snackbarController.open({ type: "success", message: "You are now an admin! Refreshing..." });
            // Reload to get new roles
            window.location.reload();
        } catch (error: any) {
            snackbarController.open({ type: "error", message: error.message || "Failed to bootstrap admin" });
        } finally {
            setBootstrapping(false);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(undefined);
        setFormKey(k => k + 1);
        setDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setSelectedUser(undefined);
    };

    const handleDelete = async () => {
        if (!userToDelete || !deleteUser) return;
        setDeleteInProgress(true);
        try {
            await deleteUser(userToDelete);
            snackbarController.open({ type: "success", message: "User deleted successfully" });
            setDeleteConfirmOpen(false);
            setUserToDelete(undefined);
        } catch (error: any) {
            snackbarController.open({ type: "error", message: error.message || "Error deleting user" });
        } finally {
            setDeleteInProgress(false);
        }
    };

    if (loading) {
        return <CenteredView><CircularProgress /></CenteredView>;
    }

    return (
        <Container className="w-full flex flex-col py-4 gap-4" maxWidth={"6xl"}>
            {/* Bootstrap warning when no admins */}
            {!hasAdmin && loggedInUser && bootstrapAdmin && (
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded p-4 flex items-center justify-between">
                    <div>
                        <Typography variant="label" className="text-yellow-800 dark:text-yellow-200">
                            No admin users exist. You can make yourself an admin.
                        </Typography>
                    </div>
                    <Button
                        onClick={handleBootstrap}
                        disabled={bootstrapping}
                    >
                        {bootstrapping ? <CircularProgress size="small" /> : "Make me admin"}
                    </Button>
                </div>
            )}

            <div className="flex items-center mt-12">
                <Typography gutterBottom variant="h4" className="grow" component="h4">
                    Users
                </Typography>
                <Button size="large" startIcon={<AddIcon />} onClick={handleAddUser} disabled={!saveUser}>
                    Add user
                </Button>
            </div>

            <div className="overflow-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableCell header className="truncate w-16"></TableCell>
                        <TableCell header>Email</TableCell>
                        <TableCell header>Name</TableCell>
                        <TableCell header>Roles</TableCell>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.uid} onClick={() => saveUser && handleEditUser(user)}>
                                <TableCell style={{ width: "64px" }}>
                                    {deleteUser && (
                                        <Tooltip asChild title="Delete this user">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUserToDelete(user);
                                                    setDeleteConfirmOpen(true);
                                                }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles?.map((r: Role) => (
                                            <RoleChip key={r.id} role={r} />
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colspan={4}>
                                    <CenteredView className="flex flex-col gap-4 my-8 items-center">
                                        <Typography variant="label">
                                            There are no users yet
                                        </Typography>
                                    </CenteredView>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* User Edit Dialog */}
            {saveUser && (
                <UserDetailsForm
                    key={selectedUser?.uid ?? `new-${formKey}`}
                    open={dialogOpen}
                    user={selectedUser}
                    roles={roles}
                    saveUser={saveUser}
                    handleClose={handleClose}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={deleteConfirmOpen}
                loading={deleteInProgress}
                onAccept={handleDelete}
                onCancel={() => { setDeleteConfirmOpen(false); setUserToDelete(undefined); }}
                title={<>Delete?</>}
                body={<>Are you sure you want to delete this user?</>}
            />
        </Container>
    );
}

// ============================================
// UserDetailsForm Component
// ============================================
function UserDetailsForm({
    open,
    user: userProp,
    roles,
    saveUser,
    handleClose
}: {
    open: boolean;
    user?: User;
    roles?: Role[];
    saveUser: (user: User) => Promise<User>;
    handleClose: () => void;
}) {
    const snackbarController = useSnackbarController();
    const isNewUser = !userProp;

    const [displayName, setDisplayName] = useState(userProp?.displayName || "");
    const [email, setEmail] = useState(userProp?.email || "");
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
        userProp?.roles?.map((r: Role) => r.id) || []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ displayName?: string; email?: string; roles?: string }>({});
    const [submitCount, setSubmitCount] = useState(0);

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!displayName) newErrors.displayName = "Required";
        if (!email) newErrors.email = "Required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitCount(c => c + 1);

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const userRoles = roles ? selectedRoleIds.map(id => roles.find(r => r.id === id) as Role).filter(Boolean) : [];
            const userToSave: User = {
                uid: userProp?.uid || crypto.randomUUID(),
                email,
                displayName: displayName || null,
                photoURL: userProp?.photoURL || null,
                providerId: userProp?.providerId || "custom",
                isAnonymous: userProp?.isAnonymous || false,
                roles: userRoles
            };
            await saveUser(userToSave);
            handleClose();
        } catch (error: any) {
            snackbarController.open({ type: "error", message: error.message || "Failed to save user" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const dirty = isNewUser ||
        displayName !== (userProp?.displayName || "") ||
        email !== (userProp?.email || "") ||
        JSON.stringify(selectedRoleIds.sort()) !== JSON.stringify((userProp?.roles?.map(r => r.id) || []).sort());

    return (
        <Dialog open={open} onOpenChange={(open) => !open ? handleClose() : undefined} maxWidth="4xl">
            <form onSubmit={handleSubmit} autoComplete="off" noValidate
                style={{ display: "flex", flexDirection: "column", position: "relative", height: "100%" }}>

                <DialogTitle variant="h4" gutterBottom={false}>
                    User
                </DialogTitle>

                <DialogContent className="h-full grow">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <TextField
                                name="displayName"
                                required
                                error={submitCount > 0 && Boolean(errors.displayName)}
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                label="Name"
                            />
                            {submitCount > 0 && errors.displayName && (
                                <Typography variant="caption" color="error">{errors.displayName}</Typography>
                            )}
                        </div>

                        <div className="col-span-12">
                            <TextField
                                required
                                error={submitCount > 0 && Boolean(errors.email)}
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email"
                                disabled={!isNewUser}
                            />
                            {submitCount > 0 && errors.email && (
                                <Typography variant="caption" color="error">{errors.email}</Typography>
                            )}
                        </div>

                        {roles && roles.length > 0 && (
                            <div className="col-span-12">
                                <MultiSelect
                                    className="w-full"
                                    label="Roles"
                                    value={selectedRoleIds}
                                    onValueChange={(value: string[]) => setSelectedRoleIds(value)}
                                >
                                    {roles.map(role => (
                                        <MultiSelectItem key={role.id} value={role.id}>
                                            <RoleChip role={role} />
                                        </MultiSelectItem>
                                    ))}
                                </MultiSelect>
                            </div>
                        )}
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button variant="text" onClick={handleClose}>
                        Cancel
                    </Button>
                    <LoadingButton
                        variant="filled"
                        type="submit"
                        disabled={!dirty}
                        loading={isSubmitting}
                    >
                        {isNewUser ? "Create user" : "Update"}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
