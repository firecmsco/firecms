import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    CHIP_COLORS, CheckboxDisplay, Chip, Icon, IconButton, Table, TableBody, TableCell,
    TableHeader, TableRow, Typography, useMaterialIcons
} from "./firecms/ui";

/**
 * Roles and permissions — the FireCMS PRO user management view.
 *
 * Transcribed from packages/user_management/src/components/roles/RolesTable.tsx,
 * RoleChip.tsx and default_roles.tsx. Columns are (delete) / Role / Is admin /
 * Default permissions, with the permissions rendered as a plain <ul>. The role
 * chip colours are the product's own: admin blueDarker, editor yellowLight,
 * viewer grayLight.
 *
 * Autoplay only — no pointer events.
 */

type Role = {
    id: string;
    name: string;
    isAdmin?: boolean;
    defaultPermissions?: { read?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
};

/** packages/user_management/src/components/roles/default_roles.tsx */
const DEFAULT_ROLES: Role[] = [
    { id: "admin", name: "Admin", isAdmin: true },
    {
        id: "editor",
        name: "Editor",
        isAdmin: false,
        defaultPermissions: { read: true, create: true, edit: true, delete: true }
    },
    {
        id: "viewer",
        name: "Viewer",
        isAdmin: false,
        defaultPermissions: { read: true, create: false, edit: false, delete: false }
    }
];

/** A fourth role, added live, to show the table is editable. */
const SUPPORT_ROLE: Role = {
    id: "support",
    name: "Support",
    isAdmin: false,
    defaultPermissions: { read: true, create: false, edit: true, delete: false }
};

function RoleChip({ role }: { role: Role }) {
    const scheme = role.isAdmin
        ? CHIP_COLORS.blueDarker
        : role.id === "editor"
            ? CHIP_COLORS.yellowLight
            : role.id === "viewer"
                ? CHIP_COLORS.grayLight
                : undefined;
    return <Chip colorScheme={scheme}>{role.name}</Chip>;
}

export default function RolePermissionsDemo({ height = 420 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [extra, setExtra] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setExtra(v => !v), extra ? 3400 : 2600);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [extra, inView]);

    const roles = extra ? [...DEFAULT_ROLES, SUPPORT_ROLE] : DEFAULT_ROLES;

    return (
        <div ref={ref}
             className="w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-white dark:bg-surface-950"
             style={{ height }}
             aria-label="The FireCMS roles table: each role with whether it is an admin and the create, read, update and delete permissions it grants by default">
            <div className="h-full overflow-hidden p-6">
                <Typography variant={"h5"} className={"mb-4 block"}>Roles</Typography>
                <div className="w-full overflow-auto">
                    <Table className={"w-full"}>
                        <TableHeader>
                            <TableCell header className="w-16"/>
                            <TableCell header>Role</TableCell>
                            <TableCell header className={"items-center"}>Is admin</TableCell>
                            <TableCell header>Default permissions</TableCell>
                        </TableHeader>
                        <TableBody>
                            {roles.map(role => {
                                const canCreate = role.isAdmin || role.defaultPermissions?.create;
                                const canRead   = role.isAdmin || role.defaultPermissions?.read;
                                const canUpdate = role.isAdmin || role.defaultPermissions?.edit;
                                const canDelete = role.isAdmin || role.defaultPermissions?.delete;
                                return (
                                    <TableRow key={role.name} className={role.id === "support" ? "role-in" : undefined}>
                                        <TableCell style={{ width: "64px" }}>
                                            {!role.isAdmin &&
                                                <IconButton size={"small"}>
                                                    <Icon icon={"delete"}/>
                                                </IconButton>}
                                        </TableCell>
                                        <TableCell>
                                            <RoleChip role={role}/>
                                        </TableCell>
                                        <TableCell className={"items-center"}>
                                            <CheckboxDisplay checked={role.isAdmin ?? false}/>
                                        </TableCell>
                                        <TableCell>
                                            <ul>
                                                {canCreate && <li>Create</li>}
                                                {canRead   && <li>Read</li>}
                                                {canUpdate && <li>Update</li>}
                                                {canDelete && <li>Delete</li>}
                                            </ul>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .role-in { animation: rp-in 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes rp-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
