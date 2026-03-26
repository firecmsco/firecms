import React, { useState } from "react";
import { Button, IconButton, Typography, cls, defaultBorderMixin, Chip, KeyIcon, DeleteIcon, Paper, Container } from "@rebasepro/ui";
import { PostgresPolicy } from "../../components/RLSEditor/RLSEditor";
import { PolicyEditor } from "../../components/RLSEditor/PolicyEditor";
import { useFormex } from "@rebasepro/formex";
import { PersistedCollection } from "../../types/persisted_collection";

export function CollectionRLSTab() {
    const { values, setFieldValue } = useFormex<PersistedCollection>();
    const [editingPolicy, setEditingPolicy] = useState<PostgresPolicy | "new" | null>(null);

    const rules = (values as any).securityRules || [];

    const handleSave = async (newPolicy: Partial<PostgresPolicy>) => {
        const rule: any = {
            name: newPolicy.policyname,
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
            // @ts-ignore
            newRules = rules.map((r: any) => r.name === editingPolicy.policyname ? rule : r);
        }
        setFieldValue("securityRules" as any, newRules);
        setEditingPolicy(null);
    };

    if (editingPolicy) {
        return (
            <div className="h-full w-full bg-surface-50 dark:bg-surface-900 border-l border-r border-b dark:border-surface-800 rounded-b-lg p-0">
                <PolicyEditor
                    policy={editingPolicy === "new" ? undefined : editingPolicy}
                    schema={"public"}
                    table={(values as any).id || (values as any).dbPath || (values as any).alias || "your_table"}
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
                        {rules.map((rule: any) => (
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
                                        tablename: (values as any).id || (values as any).dbPath || (values as any).alias || "your_table",
                                        permissive: (rule.mode || "permissive").toUpperCase() as any,
                                        cmd: (rule.operation || "ALL").toUpperCase() as any,
                                        roles: rule.roles || ["public"],
                                        qual: rule.using || null,
                                        with_check: rule.withCheck || null
                                    })}>
                                        EDIT
                                    </Button>
                                    <IconButton size="small" onClick={() => {
                                        setFieldValue("securityRules" as any, rules.filter((r: any) => r.name !== rule.name));
                                    }}>
                                        <DeleteIcon size="small" className="text-text-secondary dark:text-text-secondary-dark hover:text-red-500 dark:hover:text-red-500 transition-colors" />
                                    </IconButton>
                                </div>
                            </Paper>
                        ))}
                    </div>
                )}
                </div>
            </Container>
        </div>
    );
}
