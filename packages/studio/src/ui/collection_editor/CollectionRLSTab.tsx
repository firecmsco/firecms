import React, { useState } from "react";
import { Button, Typography, cls, defaultBorderMixin, Chip, KeyIcon } from "@firecms/ui";
import { PostgresPolicy } from "../../components/RLSEditor/RLSEditor";
import { PolicyEditor } from "../../components/RLSEditor/PolicyEditor";
import { useFormex } from "@firecms/formex";
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
        <div className="h-full w-full flex flex-col p-6 bg-surface-50 dark:bg-surface-900 overflow-auto">
            <div className="flex items-start justify-between mb-4 mt-2">
                <Typography variant="h6">Row Level Security</Typography>
                <Button variant="filled" color="primary" onClick={() => setEditingPolicy("new")}>
                    Create Policy
                </Button>
            </div>

            {rules.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-text-disabled py-12">
                    <Typography variant="body2">No RLS policies defined for this collection.</Typography>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {rules.map((rule: any) => (
                        <div key={rule.name} className={cls("p-4 bg-white dark:bg-surface-950 border rounded-lg flex flex-col justify-between gap-4", defaultBorderMixin)}>
                            <div className="flex flex-col gap-2">
                                <Typography variant="subtitle2" className="flex items-center gap-2">
                                    <KeyIcon size="small" className="text-text-secondary" /> {rule.name}
                                </Typography>
                                <div className="flex gap-2 text-xs">
                                    <Chip size="small">Action: {rule.operation || "ALL"}</Chip>
                                    <Chip size="small">Roles: {Array.isArray(rule.roles) ? rule.roles.join(", ") : rule.roles}</Chip>
                                </div>
                            </div>
                            <div>
                                <Button size="small" variant="outlined" onClick={() => setEditingPolicy({
                                    policyname: rule.name,
                                    tablename: (values as any).id || (values as any).dbPath || (values as any).alias || "your_table",
                                    permissive: (rule.mode || "permissive").toUpperCase() as any,
                                    cmd: (rule.operation || "ALL").toUpperCase() as any,
                                    roles: rule.roles || ["public"],
                                    qual: rule.using || null,
                                    with_check: rule.withCheck || null
                                })}>
                                    Edit
                                </Button>
                                <Button size="small" variant="text" color="error" className="ml-2" onClick={() => {
                                    setFieldValue("securityRules" as any, rules.filter((r: any) => r.name !== rule.name));
                                }}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
