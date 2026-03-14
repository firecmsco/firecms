import React, { useCallback, useMemo, useState } from "react";
import { CMSView, EntityCollection, FieldCaption, Role, SecurityRule, User, useSnackbarController, ConfirmationDialog, useAuthController, useCollectionRegistryController } from "@rebasepro/core";

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
    MultiSelect,
    MultiSelectItem,
    LoadingButton,
    getColorSchemeForSeed
} from "@rebasepro/ui";
import { UserManagement } from "../hooks/useBackendUserManagement";

interface AdminViewsProps {
    userManagement: UserManagement;
    apiUrl: string;
    getAuthToken: () => Promise<string>;
}

/**
 * Create admin views for user and role management
 */
export function createUserManagementAdminViews({ userManagement, apiUrl, getAuthToken }: AdminViewsProps): CMSView[] {
    return [
        {
            slug: "dev/users",
            name: "CMS Users",
            group: "Admin",
            icon: "face",
            view: <UsersView userManagement={userManagement} apiUrl={apiUrl} getAuthToken={getAuthToken} />
        },
        {
            slug: "dev/roles",
            name: "Roles",
            group: "Admin",
            icon: "gpp_good",
            view: <RolesView userManagement={userManagement} />
        }
    ];
}

// ============================================
// RoleChip Component (matches original)
// ============================================
function RoleChip({ role }: { role: Role }) {
    let colorScheme: any;
    if (role.isAdmin) {
        colorScheme = "blueDarker";
    } else if (role.id === "editor") {
        colorScheme = "yellowLight";
    } else if (role.id === "viewer") {
        colorScheme = "grayLight";
    } else {
        colorScheme = getColorSchemeForSeed(role.id);
    }

    return (
        <Chip colorScheme={colorScheme as any} key={role.id}>
            {role.name}
        </Chip>
    );
}

// ============================================
// UsersView Component
// ============================================
export function UsersView({ userManagement, apiUrl, getAuthToken }: {
    userManagement: UserManagement;
    apiUrl: string;
    getAuthToken: () => Promise<string>;
}) {
    const { users, roles, saveUser, deleteUser, loading } = userManagement;
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
    const hasAdmin = users.some(u => u.roles?.includes("admin"));

    const handleBootstrap = async () => {
        setBootstrapping(true);
        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/api/admin/bootstrap`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "Bootstrap failed");
            }
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
        if (!userToDelete) return;
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
            {!hasAdmin && loggedInUser && (
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
                <Button size="large" startIcon={<AddIcon />} onClick={handleAddUser}>
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
                            <TableRow key={user.uid} onClick={() => handleEditUser(user)}>
                                <TableCell style={{ width: "64px" }}>
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
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles?.map((roleId: string) => {
                                            const role = roles.find(r => r.id === roleId);
                                            return role ? <RoleChip key={roleId} role={role} /> : <span key={roleId}>{roleId}</span>;
                                        })}
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
            <UserDetailsForm
                key={selectedUser?.uid ?? `new-${formKey}`}
                open={dialogOpen}
                user={selectedUser}
                roles={roles}
                saveUser={saveUser}
                handleClose={handleClose}
            />

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
// UserDetailsForm Component (matches original)
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
    roles: Role[];
    saveUser: (user: User) => Promise<User>;
    handleClose: () => void;
}) {
    const snackbarController = useSnackbarController();
    const isNewUser = !userProp;

    const [displayName, setDisplayName] = useState(userProp?.displayName || "");
    const [email, setEmail] = useState(userProp?.email || "");
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
        userProp?.roles || ["editor"]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ displayName?: string; email?: string; roles?: string }>({});
    const [submitCount, setSubmitCount] = useState(0);

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!displayName) newErrors.displayName = "Required";
        if (!email) newErrors.email = "Required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
        if (selectedRoleIds.length === 0) newErrors.roles = "At least one role is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitCount(c => c + 1);

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const userToSave: User = {
                uid: userProp?.uid || crypto.randomUUID(),
                email,
                displayName: displayName || null,
                photoURL: userProp?.photoURL || null,
                providerId: "custom",
                isAnonymous: false,
                roles: selectedRoleIds
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
        JSON.stringify(selectedRoleIds.sort()) !== JSON.stringify((userProp?.roles || []).sort());

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
                            <FieldCaption>
                                {submitCount > 0 && errors.displayName ? errors.displayName : "Name of this user"}
                            </FieldCaption>
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
                            <FieldCaption>
                                {submitCount > 0 && errors.email ? errors.email : "Email of this user"}
                            </FieldCaption>
                        </div>

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

// ============================================
// RolesView Component
// ============================================
export function RolesView({ userManagement }: { userManagement: UserManagement }) {
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
        if (!roleToDelete) return;
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
                <Button size="large" startIcon={<AddIcon />} onClick={handleAddRole}>
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
                        {roles.map(role => {
                            return (
                                <TableRow key={role.id} onClick={() => handleEditRole(role)}>
                                    <TableCell style={{ width: "64px" }}>
                                        {!role.isAdmin && (
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
                                        <Checkbox checked={role.isAdmin ?? false} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {roles.length === 0 && (
                            <TableRow>
                                <TableCell colspan={4}>
                                    <CenteredView className="flex flex-col gap-4 my-8 items-center">
                                        <Typography variant="label">
                                            You don't have any roles yet.
                                        </Typography>
                                        {allowDefaultRolesCreation && (
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
            <RoleDetailsForm
                key={selectedRole?.id ?? "new"}
                open={dialogOpen}
                role={selectedRole}
                saveRole={saveRole}
                handleClose={handleClose}
            />

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
        <Dialog open={open} onOpenChange={(open) => !open ? handleClose() : undefined} maxWidth="6xl">
            <form onSubmit={handleSubmit} autoComplete="off" noValidate
                style={{ display: "flex", flexDirection: "column", position: "relative", height: "100%" }}>

                <DialogTitle variant="h4" gutterBottom={false}>
                    Role
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
                                label="Role ID"
                                disabled={!isNewRole}
                            />
                            <FieldCaption>
                                {submitCount > 0 && errors.id ? errors.id : "Unique identifier for this role"}
                            </FieldCaption>
                        </div>

                        <div className="col-span-12 sm:col-span-4">
                            <TextField
                                name="name"
                                required
                                error={submitCount > 0 && Boolean(errors.name)}
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                label="Role Name"
                            />
                            <FieldCaption>
                                {submitCount > 0 && errors.name ? errors.name : "Display name for this role"}
                            </FieldCaption>
                        </div>

                        <div className="col-span-12 sm:col-span-4 flex items-start pt-2">
                            <label className="flex items-center gap-2 cursor-pointer mt-3">
                                <Checkbox
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(Boolean(checked))}
                                />
                                <span className="font-medium">Is Admin</span>
                            </label>
                        </div>

                        {/* Permissions matrix */}
                        <div className="col-span-12">
                            <CollectionPermissionsMatrix roleId={roleId} isAdmin={isAdmin} />
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
                        loading={isSubmitting}
                    >
                        {isNewRole ? "Create role" : "Update"}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// ============================================
// CollectionPermissionsMatrix Component
// ============================================
const CRUD_OPS = [
    { op: "select" as const, label: "Read" },
    { op: "insert" as const, label: "Create" },
    { op: "update" as const, label: "Edit" },
    { op: "delete" as const, label: "Delete" },
];

/** Inline check: does roleId have access for this operation on these securityRules? */
function hasRoleAccess(
    rules: SecurityRule[] | undefined,
    roleId: string,
    op: "select" | "insert" | "update" | "delete"
): boolean {
    if (!rules || rules.length === 0) return true; // no rules = unrestricted
    const applicable = rules.filter(r =>
        r.operation === op || r.operation === "all" ||
        r.operations?.includes(op) || r.operations?.includes("all")
    );
    if (applicable.length === 0) return false;
    const forRole = applicable.filter(r =>
        !r.roles || r.roles.length === 0 || r.roles.includes(roleId) || r.roles.includes("public")
    );
    if (forRole.length === 0) return false;
    // Restrictive rules: any failing one denies immediately
    for (const r of forRole) {
        if ((r.mode ?? "permissive") === "restrictive") return false;
    }
    return forRole.some(r => (r.mode ?? "permissive") === "permissive");
}

function PermCell({ granted }: { granted: boolean }) {
    return (
        <span className={granted
            ? "text-green-500 dark:text-green-400 text-base select-none"
            : "text-surface-300 dark:text-surface-600 text-base select-none"}
        >
            {granted ? "✓" : "✗"}
        </span>
    );
}

function CollectionPermissionsMatrix({ roleId, isAdmin }: { roleId: string; isAdmin: boolean }) {
    const { collections } = useCollectionRegistryController();

    if (!collections || collections.length === 0) {
        return (
            <div className="mt-4">
                <Typography variant="label" className="text-surface-400">No collections configured</Typography>
            </div>
        );
    }

    const topLevel = collections.filter(c => !c.collectionGroup);

    return (
        <div className="mt-6">
            <Typography variant="label" className="mb-2 block text-surface-600 dark:text-surface-400 uppercase tracking-wide text-xs">
                Collection permissions
            </Typography>
            <div className="rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell header>Collection</TableCell>
                            {CRUD_OPS.map(({ op, label }) => (
                                <TableCell key={op} header className="text-center w-24">{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topLevel.map((collection) => {
                            const noRules = !collection.securityRules || collection.securityRules.length === 0;
                            return (
                                <TableRow key={collection.slug}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{collection.name}</span>
                                            {noRules && !isAdmin && (
                                                <Tooltip title="No security rules — unrestricted">
                                                    <Chip className="text-xs" colorScheme="yellowLight">No rules</Chip>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <span className="text-xs text-surface-400 font-mono">{collection.slug}</span>
                                    </TableCell>
                                    {CRUD_OPS.map(({ op }) => (
                                        <TableCell key={op} className="text-center">
                                            <PermCell granted={isAdmin || hasRoleAccess(collection.securityRules, roleId, op)} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            {!roleId && (
                <Typography variant="caption" className="mt-2 text-surface-400 italic">
                    Enter a role ID above to preview permissions
                </Typography>
            )}
        </div>
    );
}
