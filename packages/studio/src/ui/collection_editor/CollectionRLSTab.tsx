import React, { useState, useEffect } from "react";
import { Button, IconButton, Typography, cls, defaultBorderMixin, Chip, KeyIcon, DeleteIcon, Paper, Container, Tooltip, CircularProgress } from "@rebasepro/ui";
import { PostgresPolicy } from "../../components/RLSEditor/RLSEditor";
import { PolicyEditor } from "../../components/RLSEditor/PolicyEditor";
import { useFormex } from "@rebasepro/formex";
import { useRebaseContext } from "@rebasepro/core";
import { PersistedCollection } from "../../types/persisted_collection";

interface SecurityRule {
    name: string;
    operation?: string;
    mode?: string;
    using?: string;
    withCheck?: string;
    roles?: string[];
}

type CollectionWithSecurity = PersistedCollection & {
    securityRules?: SecurityRule[];
    id?: string;
    dbPath?: string;
    alias?: string;
};

export function CollectionRLSTab() {
    const { values, setFieldValue } = useFormex<CollectionWithSecurity>();
    const [editingPolicy, setEditingPolicy] = useState<PostgresPolicy | "new" | null>(null);

    const rules: SecurityRule[] = values.securityRules || [];

    const { databaseAdmin } = useRebaseContext();
    const [dbPolicies, setDbPolicies] = useState<PostgresPolicy[]>([]);
    const [isLoadingDb, setIsLoadingDb] = useState(false);

    useEffect(() => {
        const fetchLivePolicies = async () => {
            const tableName = values.id || values.dbPath || values.alias;
            if (!tableName || !databaseAdmin?.executeSql) return;

            setIsLoadingDb(true);
            try {
                const sql = `
                    SELECT policyname, permissive, roles, cmd, qual, with_check
                    FROM pg_policies
                    WHERE tablename = '${tableName}' AND schemaname NOT IN ('information_schema', 'pg_catalog');
                `;
                const result = await databaseAdmin.executeSql(sql);
                const extractRows = (res: unknown): Record<string, unknown>[] => {
                    if (res && typeof res === "object" && "rows" in res && Array.isArray((res as { rows: Record<string, unknown>[] }).rows)) {
                        return (res as { rows: Record<string, unknown>[] }).rows;
                    }
                    if (Array.isArray(res)) return res as Record<string, unknown>[];
                    return [];
                };
                const pRows = extractRows(result);
                const policies: PostgresPolicy[] = pRows.map((p: any) => {
                    let parsedRoles: string[] = [];
                    const r = p.roles || p.ROLES;
                    if (Array.isArray(r)) {
                        parsedRoles = r as string[];
                    } else if (typeof r === "string") {
                        parsedRoles = r.replace(/^{|}$/g, "").split(",").map((s: string) => s.trim());
                    }
                    return {
                        policyname: (p.policyname || p.POLICYNAME || "") as string,
                        tablename: tableName,
                        permissive: (p.permissive || p.PERMISSIVE || "PERMISSIVE") as "PERMISSIVE" | "RESTRICTIVE",
                        roles: parsedRoles,
                        cmd: (p.cmd || p.CMD || "ALL") as "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL",
                        qual: (p.qual || p.QUAL || null) as string | null,
                        with_check: (p.with_check || p.WITH_CHECK || null) as string | null,
                    };
                });
                setDbPolicies(policies);
            } catch (e) {
                console.error("Failed to fetch DB policies", e);
            } finally {
                setIsLoadingDb(false);
            }
        };
        fetchLivePolicies();
    }, [databaseAdmin, values.id, values.dbPath, values.alias]);

    const unmappedPolicies = dbPolicies.filter(dp => !rules.some(r => r.name === dp.policyname));

    const handleSave = async (newPolicy: Partial<PostgresPolicy>) => {
        const rule: SecurityRule = {
            name: newPolicy.policyname ?? "",
            operation: newPolicy.cmd?.toLowerCase(),
            mode: newPolicy.permissive?.toLowerCase(),
            using: newPolicy.qual || undefined,
            withCheck: newPolicy.with_check || undefined,
            roles: newPolicy.roles
        };

        let newRules;
        if (editingPolicy === "new") {
            newRules = [...rules, rule];
        } else {
            newRules = rules.map((r: SecurityRule) => r.name === (editingPolicy as PostgresPolicy).policyname ? rule : r);
        }
        setFieldValue("securityRules", newRules);
        setEditingPolicy(null);
    };

    if (editingPolicy) {
        return (
            <div className="h-full w-full bg-surface-50 dark:bg-surface-900 border-l border-r border-b dark:border-surface-800 rounded-b-lg p-0">
                <PolicyEditor
                    policy={editingPolicy === "new" ? undefined : editingPolicy}
                    schema={"public"}
                    table={values.id || values.dbPath || values.alias || "your_table"}
                    onSave={handleSave}
                    onCancel={() => setEditingPolicy(null)}
                />
            </div>
        );
    }

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>
                <div className="w-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <Typography variant="h5">Row Level Security</Typography>
                    <Button variant="filled" color="neutral" onClick={() => setEditingPolicy("new")}>
                        CREATE POLICY
                    </Button>
                </div>

                {rules.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center text-text-disabled py-12">
                        <Typography variant="body2">No RLS policies defined for this collection.</Typography>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {rules.map((rule: SecurityRule) => (
                            <Paper key={rule.name} 
                                className={"p-4 border border-transparent hover:border-surface-200 dark:hover:border-surface-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors bg-white dark:bg-surface-950 shadow-sm"}>
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <KeyIcon size="small" className="text-text-disabled dark:text-text-disabled-dark shrink-0" />
                                        <Typography variant="subtitle2" className="truncate">{rule.name}</Typography>
                                    </div>
                                    <div className="flex gap-2 text-xs pl-6 overflow-x-auto hide-scrollbar">
                                        <Chip size="small" className="bg-surface-100 dark:bg-surface-800 text-text-secondary border-none">Action: {rule.operation || "ALL"}</Chip>
                                        <Chip size="small" className="bg-surface-100 dark:bg-surface-800 text-text-secondary border-none">Roles: {Array.isArray(rule.roles) ? rule.roles.join(", ") : rule.roles}</Chip>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    <Button size="small" variant="text" onClick={() => setEditingPolicy({
                                        policyname: rule.name,
                                        tablename: values.id || values.dbPath || values.alias || "your_table",
                                        permissive: (rule.mode || "permissive").toUpperCase() as PostgresPolicy["permissive"],
                                        cmd: (rule.operation || "ALL").toUpperCase() as PostgresPolicy["cmd"],
                                        roles: rule.roles || ["public"],
                                        qual: rule.using || null,
                                        with_check: rule.withCheck || null
                                    })}>
                                        EDIT
                                    </Button>
                                    <IconButton size="small" onClick={() => {
                                        setFieldValue("securityRules", rules.filter((r: SecurityRule) => r.name !== rule.name));
                                    }}>
                                        <DeleteIcon size="small" className="text-text-secondary dark:text-text-secondary-dark hover:text-red-500 dark:hover:text-red-500 transition-colors" />
                                    </IconButton>
                                </div>
                            </Paper>
                        ))}
                    </div>
                )}
                
                {isLoadingDb && unmappedPolicies.length === 0 && (
                    <div className="flex justify-center mt-8">
                        <CircularProgress size="small" />
                    </div>
                )}

                {!isLoadingDb && unmappedPolicies.length > 0 && (
                    <div className="mt-12 flex flex-col gap-4">
                        <Typography variant="h6" className="text-text-secondary">Unmapped Database Policies</Typography>
                        <Typography variant="body2" className="text-text-secondary opacity-80 -mt-2">
                            These policies exist in your Postgres database but are not mapped to this collection's codebase configuration.
                        </Typography>
                        <div className="flex flex-col gap-3">
                            {unmappedPolicies.map(dp => (
                                <Paper key={dp.policyname} 
                                    className={"p-4 border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"}>
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <KeyIcon size="small" className="text-orange-500 shrink-0" />
                                            <Typography variant="subtitle2" className="truncate">{dp.policyname}</Typography>
                                            <Tooltip title="This policy is live in the database but missing from your codebase schema.">
                                                <div className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
                                                    DB Only
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <div className="flex gap-2 text-xs pl-6 overflow-x-auto hide-scrollbar">
                                            <Chip size="small" className="bg-white dark:bg-surface-900 text-text-secondary border-none">Action: {dp.cmd || "ALL"}</Chip>
                                            <Chip size="small" className="bg-white dark:bg-surface-900 text-text-secondary border-none">Roles: {Array.isArray(dp.roles) ? dp.roles.join(", ") : dp.roles}</Chip>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                        <Button size="small" variant="outlined" color="primary" onClick={() => {
                                             const rule: SecurityRule = {
                                                name: dp.policyname,
                                                operation: dp.cmd?.toLowerCase(),
                                                mode: dp.permissive?.toLowerCase(),
                                                using: dp.qual || undefined,
                                                withCheck: dp.with_check || undefined,
                                                roles: dp.roles
                                            };
                                            setFieldValue("securityRules", [...rules, rule]);
                                        }}>
                                            Import to codebase
                                        </Button>
                                    </div>
                                </Paper>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </Container>
        </div>
    );
}
