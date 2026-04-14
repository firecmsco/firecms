import React, { useState, useEffect, useCallback, useRef } from "react";
import { User } from "@rebasepro/types";
import { useSnackbarController, useAuthController, useTranslation } from "@rebasepro/core";
import { useBreadcrumbsController } from "../../index";
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
    LoadingButton,
    ContentCopyIcon,
    CheckCircleIcon,
    EmailIcon,
    SearchBar,
    LockResetIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@rebasepro/ui";
import { RoleChip } from "./RoleChip";
import { UserManagementDelegate, Role, UserCreationResult } from "@rebasepro/types";
import { ConfirmationDialog } from "@rebasepro/core";

const PAGE_SIZE = 25;

// ============================================
// UsersView Component
// ============================================
export function UsersView({ userManagement }: {
    userManagement: UserManagementDelegate;
}) {
    const { roles, saveUser, createUser, deleteUser, resetPassword, loading: delegateLoading, bootstrapAdmin } = userManagement;
    const snackbarController = useSnackbarController();
    const { user: loggedInUser } = useAuthController();
    const { t } = useTranslation();
    const breadcrumbs = useBreadcrumbsController();

    React.useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: [{ title: t("users"), url: "/users" }]
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | undefined>();
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [bootstrapping, setBootstrapping] = useState(false);

    // Creation result state
    const [creationResult, setCreationResult] = useState<UserCreationResult | null>(null);

    // Reset password
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    const [userToReset, setUserToReset] = useState<User | undefined>();
    const [resetInProgress, setResetInProgress] = useState(false);

    // ---- Server-side pagination state ----
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);

    // Debounce timer ref for search
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Check if server-side search is available
    const hasServerSearch = !!userManagement.searchUsers;

    // Fallback: use in-memory users if no searchUsers
    const allUsers = userManagement.users;

    /**
     * Fetch a page of users from the server
     */
    const fetchPage = useCallback(async (pageNum: number, search: string) => {
        if (!userManagement.searchUsers) return;
        
        setTableLoading(true);
        try {
            const result = await userManagement.searchUsers({
                search: search || undefined,
                limit: PAGE_SIZE,
                offset: pageNum * PAGE_SIZE,
                orderBy: "createdAt",
                orderDir: "desc"
            });
            setPaginatedUsers(result.users);
            setTotalUsers(result.total);
        } catch (error: unknown) {
            console.error("Failed to fetch users:", error);
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : "Failed to load users" });
        } finally {
            setTableLoading(false);
        }
    }, [userManagement.searchUsers, snackbarController]);

    // Load initial page when delegate finishes loading
    useEffect(() => {
        if (!delegateLoading && hasServerSearch) {
            fetchPage(0, "");
        }
    }, [delegateLoading, hasServerSearch, fetchPage]);

    // Handle search changes (debounced)
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setPage(0);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        if (hasServerSearch) {
            searchTimerRef.current = setTimeout(() => {
                fetchPage(0, value);
            }, 300);
        }
    }, [hasServerSearch, fetchPage]);

    // Handle page change
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        if (hasServerSearch) {
            fetchPage(newPage, searchQuery);
        }
    }, [hasServerSearch, fetchPage, searchQuery]);

    // Refresh current page (after create/update/delete)
    const refreshCurrentPage = useCallback(() => {
        if (hasServerSearch) {
            fetchPage(page, searchQuery);
        }
    }, [hasServerSearch, fetchPage, page, searchQuery]);

    // Determine which users to show
    let displayUsers: User[];
    let displayTotal: number;

    if (hasServerSearch) {
        displayUsers = paginatedUsers;
        displayTotal = totalUsers;
    } else {
        // Fallback: local filtering for backward compat
        const filtered = allUsers.filter(u => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
        });
        displayTotal = filtered.length;
        displayUsers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    }

    const totalPages = Math.max(1, Math.ceil(displayTotal / PAGE_SIZE));

    // Check if any admin exists
    const hasAdmin = allUsers.some(u => u.roles?.includes("admin"));

    const handleBootstrap = async () => {
        if (!bootstrapAdmin) return;
        setBootstrapping(true);
        try {
            await bootstrapAdmin();
            snackbarController.open({ type: "success", message: t("bootstrap_admin_success") });
            window.location.reload();
        } catch (error: unknown) {
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : t("failed_to_bootstrap_admin") });
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
            snackbarController.open({ type: "success", message: t("user_deleted_successfully") });
            setDeleteConfirmOpen(false);
            setUserToDelete(undefined);
            refreshCurrentPage();
        } catch (error: unknown) {
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : t("error_deleting_user") });
        } finally {
            setDeleteInProgress(false);
        }
    };

    const handleResetPassword = async () => {
        if (!userToReset || !resetPassword) return;
        setResetInProgress(true);
        try {
            const result = await resetPassword(userToReset);
            setResetConfirmOpen(false);
            setUserToReset(undefined);
            setCreationResult(result);
            snackbarController.open({ type: "success", message: t("reset_password_success") });
        } catch (error: unknown) {
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : t("error_resetting_password") });
        } finally {
            setResetInProgress(false);
        }
    };

    if (delegateLoading) {
        return <CenteredView><CircularProgress /></CenteredView>;
    }

    return (
        <Container className="w-full flex flex-col py-4 gap-4" maxWidth={"6xl"}>
            {/* Bootstrap warning when no admins */}
            {!hasAdmin && loggedInUser && bootstrapAdmin && (
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded p-4 flex items-center justify-between">
                    <div>
                        <Typography variant="label" className="text-yellow-800 dark:text-yellow-200">
                            {t("no_users_or_roles_defined")}
                        </Typography>
                    </div>
                    <Button
                        onClick={handleBootstrap}
                        disabled={bootstrapping}
                    >
                        {bootstrapping ? <CircularProgress size="small" /> : t("add_logged_user_as_admin")}
                    </Button>
                </div>
            )}

            <div className="flex items-center mt-12 mb-4 gap-4">
                <Typography gutterBottom variant="h4" className="grow mb-0" component="h4">
                    {t("users")}
                </Typography>
                <SearchBar 
                    placeholder={t("search_users")} 
                    onTextSearch={(v) => handleSearch(v || "")} 
                    size="small"
                    expandable
                />
                <Button startIcon={<AddIcon />} onClick={handleAddUser} disabled={!saveUser}>
                    {t("add_user")}
                </Button>
            </div>

            <div className="overflow-auto">
                {tableLoading && (
                    <div className="flex justify-center py-4">
                        <CircularProgress size="small" />
                    </div>
                )}
                <Table className="w-full">
                    <TableHeader>
                        <TableCell header>{t("email")}</TableCell>
                        <TableCell header>{t("name")}</TableCell>
                        <TableCell header>{t("roles")}</TableCell>
                        <TableCell header className="whitespace-nowrap">{t("created")}</TableCell>
                        <TableCell header className="w-24 text-right">{t("actions")}</TableCell>
                    </TableHeader>
                    <TableBody>
                        {displayUsers.map(user => (
                            <TableRow key={user.uid} onClick={() => saveUser && handleEditUser(user)}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles?.map((roleId: string) => {
                                            const role = roles?.find(r => r.id === roleId);
                                            return role ? <RoleChip key={roleId} role={role} /> : <span key={roleId}>{roleId}</span>;
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-sm text-surface-accent-600 dark:text-surface-accent-400">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    <div className="flex justify-end items-center gap-1">
                                        {resetPassword && (
                                            <Tooltip asChild title={t("reset_password")}>
                                                <IconButton
                                                    size="smallest"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUserToReset(user);
                                                        setResetConfirmOpen(true);
                                                    }}>
                                                    <LockResetIcon size="smallest" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {deleteUser && (
                                            <Tooltip asChild title={t("delete_this_user")}>
                                                <IconButton
                                                    size="smallest"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUserToDelete(user);
                                                        setDeleteConfirmOpen(true);
                                                    }}>
                                                    <DeleteIcon size="smallest" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {displayUsers.length === 0 && !tableLoading && (
                            <TableRow>
                                <TableCell colspan={5}>
                                    <CenteredView className="flex flex-col gap-4 my-8 items-center">
                                        <Typography variant="label">
                                            {searchQuery ? t("no_users_found") : t("no_users_yet")}
                                        </Typography>
                                    </CenteredView>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {displayTotal > PAGE_SIZE && (
                <div className="flex items-center justify-between px-2 py-3">
                    <Typography variant="body2" className="text-surface-accent-500 dark:text-surface-accent-400">
                        {`${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, displayTotal)} / ${displayTotal}`}
                    </Typography>
                    <div className="flex items-center gap-1">
                        <IconButton
                            size="small"
                            disabled={page === 0}
                            onClick={() => handlePageChange(page - 1)}>
                            <ChevronLeftIcon size="small" />
                        </IconButton>
                        <Typography variant="body2" className="px-3 text-surface-accent-600 dark:text-surface-accent-300">
                            {page + 1} / {totalPages}
                        </Typography>
                        <IconButton
                            size="small"
                            disabled={page >= totalPages - 1}
                            onClick={() => handlePageChange(page + 1)}>
                            <ChevronRightIcon size="small" />
                        </IconButton>
                    </div>
                </div>
            )}

            {/* User Edit Dialog */}
            {saveUser && (
                <UserDetailsForm
                    key={selectedUser?.uid ?? `new-${formKey}`}
                    open={dialogOpen}
                    user={selectedUser}
                    roles={roles}
                    saveUser={saveUser}
                    createUser={createUser}
                    handleClose={handleClose}
                    onCreationResult={setCreationResult}
                    onSaved={refreshCurrentPage}
                />
            )}

            {/* Creation Result Dialog */}
            {creationResult && (
                <CreationResultDialog
                    result={creationResult}
                    onClose={() => setCreationResult(null)}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={deleteConfirmOpen}
                loading={deleteInProgress}
                onAccept={handleDelete}
                onCancel={() => { setDeleteConfirmOpen(false); setUserToDelete(undefined); }}
                title={<>{t("delete_confirmation_title")}</>}
                body={<>{t("delete_user_confirmation")}</>}
            />

            {/* Reset Password Confirmation */}
            <ConfirmationDialog
                open={resetConfirmOpen}
                loading={resetInProgress}
                onAccept={handleResetPassword}
                onCancel={() => { setResetConfirmOpen(false); setUserToReset(undefined); }}
                title={<>{t("reset_password")}</>}
                body={<>{t("reset_password_confirmation")}</>}
            />
        </Container>
    );
}

// ============================================
// CreationResultDialog Component
// ============================================
function CreationResultDialog({
    result,
    onClose
}: {
    result: UserCreationResult;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const snackbarController = useSnackbarController();
    const [copied, setCopied] = useState(false);

    const handleCopyPassword = async () => {
        if (!result.temporaryPassword) return;
        try {
            await navigator.clipboard.writeText(result.temporaryPassword);
            setCopied(true);
            snackbarController.open({ type: "success", message: t("password_copied") ?? "Password copied to clipboard" });
            setTimeout(() => setCopied(false), 3000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = result.temporaryPassword;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    if (result.invitationSent) {
        // Invitation sent via email
        return (
            <Dialog open={true} onOpenChange={(open) => !open ? onClose() : undefined} maxWidth="xl">
                <DialogTitle variant="h5" gutterBottom={false}>
                    <div className="flex items-center gap-3">
                        <EmailIcon />
                        {t("invitation_sent_title") ?? "Invitation Sent"}
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <Typography className="text-green-800 dark:text-green-200">
                                {(t("invitation_sent") ?? "An invitation email has been sent to {{email}}. They can use the link to set their password.")
                                    .replace("{{email}}", result.user.email ?? "")}
                            </Typography>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" onClick={onClose}>
                        {t("ok")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (result.temporaryPassword) {
        // No email — show temporary password
        return (
            <Dialog open={true} onOpenChange={(open) => !open ? onClose() : undefined} maxWidth="xl">
                <DialogTitle variant="h5" gutterBottom={false}>
                    {t("temporary_password") ?? "Temporary Password"}
                </DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <Typography className="text-amber-800 dark:text-amber-200" variant="body2">
                                {t("temporary_password_description") ??
                                    "Email is not configured. Share this temporary password with the user securely. It will not be shown again."}
                            </Typography>
                        </div>

                        <div>
                            <Typography variant="caption" color="secondary" className="mb-1">
                                {t("email")}
                            </Typography>
                            <Typography>
                                {result.user.email}
                            </Typography>
                        </div>

                        <div>
                            <Typography variant="caption" color="secondary" className="mb-1">
                                {t("temporary_password") ?? "Temporary Password"}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-grow bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded px-3 py-2 font-mono text-base select-all">
                                    {result.temporaryPassword}
                                </code>
                                <Tooltip title={t("copy_password") ?? "Copy password"} asChild>
                                    <IconButton onClick={handleCopyPassword}>
                                        {copied ? <CheckCircleIcon className="text-green-600" /> : <ContentCopyIcon />}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" onClick={onClose}>
                        {t("ok")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Shouldn't happen, but fallback
    return null;
}

// ============================================
// UserDetailsForm Component
// ============================================
function UserDetailsForm({
    open,
    user: userProp,
    roles,
    saveUser,
    createUser,
    handleClose,
    onCreationResult,
    onSaved
}: {
    open: boolean;
    user?: User;
    roles?: Role[];
    saveUser: (user: User) => Promise<User>;
    createUser?: (user: User) => Promise<UserCreationResult>;
    handleClose: () => void;
    onCreationResult?: (result: UserCreationResult) => void;
    onSaved?: () => void;
}) {
    const snackbarController = useSnackbarController();
    const { t } = useTranslation();
    const isNewUser = !userProp;

    const [displayName, setDisplayName] = useState(userProp?.displayName || "");
    const [email, setEmail] = useState(userProp?.email || "");
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
        userProp?.roles || []
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
            const userRoles = selectedRoleIds;
            const userToSave: User = {
                uid: userProp?.uid || crypto.randomUUID(),
                email,
                displayName: displayName || null,
                photoURL: userProp?.photoURL || null,
                providerId: userProp?.providerId || "custom",
                isAnonymous: userProp?.isAnonymous || false,
                roles: userRoles
            };

            if (isNewUser && createUser && onCreationResult) {
                // Use createUser for new users to get invitation/password info
                const result = await createUser(userToSave);
                handleClose();
                onCreationResult(result);
            } else {
                await saveUser(userToSave);
                handleClose();
            }
            onSaved?.();
        } catch (error: unknown) {
            snackbarController.open({ type: "error", message: error instanceof Error ? error.message : "Failed to save user" });
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
                    {t("user")}
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
                                label={t("name")}
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
                                label={t("email")}
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
                                    label={t("roles")}
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
                        {t("cancel")}
                    </Button>
                    <LoadingButton
                        variant="filled"
                        type="submit"
                        disabled={!dirty}
                        loading={isSubmitting}
                    >
                        {isNewUser ? t("create_user") : t("update")}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
