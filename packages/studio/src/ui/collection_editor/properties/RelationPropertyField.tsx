import React, { useCallback, useEffect } from "react";
import { useFormex } from "@rebasepro/formex";
import {
    FieldCaption,
    useCollectionRegistryController
} from "@rebasepro/core";
import {
    Select,
    SelectItem,
    TextField,
    Typography
} from "@rebasepro/ui";
import { EntityCollection, OnAction, RelationProperty } from "@rebasepro/types";

import { CollectionsSelect } from "./ReferencePropertyField";

const ON_ACTION_OPTIONS: OnAction[] = ["cascade", "restrict", "no action", "set null", "set default"];

/**
 * Property editor form for `type: "relation"` properties.
 *
 * This component edits both:
 *  1. The `RelationProperty` fields on the property itself (relationName, etc.)
 *  2. The matching `Relation` entry in `collection.relations[]`
 *
 * When a user configures a relation property, we sync the relation config
 * back to the parent collection's `relations` array so saving the collection
 * persists everything in one go.
 */
export function RelationPropertyField({
    disabled,
    showErrors
}: {
    disabled: boolean;
    showErrors: boolean;
}) {
    const {
        values,
        errors,
        setFieldValue
    } = useFormex<RelationProperty & { id?: string }>();

    const collectionRegistry = useCollectionRegistryController();

    // ─── Read the parent collection form to sync `relations[]` ───
    // The PropertyForm is nested inside a parent Formex for the whole collection.
    // We reach it via a second useFormex keyed to the parent context.
    // However, the PropertyForm uses its own isolated Formex, so we can't
    // directly access the parent. Instead, we store the relation config
    // on the property itself and let the save logic merge it.
    //
    // We store the full relation config on a transient `_relationConfig` key
    // so the consumer (CollectionPropertiesEditorForm / save logic) can
    // extract it and place it in `collection.relations[]`.

    const relationName = values.relationName ?? "";
    // Transient config object stored on the property for editor use.
    // Contains standard Relation fields plus `_targetSlug` for the UI dropdown.
    const relationConfig: Record<string, any> = (values as any)._relationConfig ?? {};

    const targetSlug = relationConfig._targetSlug ?? "";
    const cardinality = relationConfig.cardinality ?? "one";
    const direction = relationConfig.direction ?? "owning";
    const localKey = relationConfig.localKey ?? "";
    const foreignKeyOnTarget = relationConfig.foreignKeyOnTarget ?? "";
    const throughTable = relationConfig.through?.table ?? "";
    const throughSourceColumn = relationConfig.through?.sourceColumn ?? "";
    const throughTargetColumn = relationConfig.through?.targetColumn ?? "";
    const onUpdate = relationConfig.onUpdate ?? "no action";
    const onDelete = relationConfig.onDelete ?? "no action";

    // Whether to show the junction table section
    const showThrough = cardinality === "many" && direction === "owning";
    // Whether to show the local key field
    const showLocalKey = direction === "owning" && cardinality === "one";
    // Whether to show the foreign key on target field
    const showForeignKey = direction === "inverse";

    const updateRelationConfig = useCallback(
        (patch: Record<string, any>) => {
            const current = (values as any)._relationConfig ?? {};
            setFieldValue("_relationConfig" as any, { ...current, ...patch });
        },
        [values, setFieldValue]
    );

    const updateThrough = useCallback(
        (patch: Record<string, any>) => {
            const current = (values as any)._relationConfig ?? {};
            const currentThrough = current.through ?? {};
            setFieldValue("_relationConfig" as any, {
                ...current,
                through: { ...currentThrough, ...patch }
            });
        },
        [values, setFieldValue]
    );

    // Auto-generate relationName from target collection slug
    useEffect(() => {
        if (targetSlug && !relationName) {
            setFieldValue("relationName", targetSlug);
        }
    }, [targetSlug]);

    const collections: EntityCollection[] = collectionRegistry?.collections ?? [];

    return (
        <>
            {/* ─── Target Collection ─── */}
            <div className={"col-span-12"}>
                <CollectionsSelect
                    disabled={disabled}
                    pathPath={"_relationConfig._targetSlug"}
                    value={targetSlug}
                    setFieldValue={(_, value) => {
                        updateRelationConfig({ _targetSlug: value });
                        // Auto-generate relation name from target
                        if (!relationName || relationName === targetSlug) {
                            setFieldValue("relationName", value);
                        }
                    }}
                    error={showErrors && !targetSlug ? "You must select a target collection" : undefined}
                />
                <FieldCaption error={showErrors && !targetSlug}>
                    {showErrors && !targetSlug
                        ? "You must select a target collection"
                        : "The collection this relation points to"}
                </FieldCaption>
            </div>

            {/* ─── Relation Name ─── */}
            <div className={"col-span-12"}>
                <TextField
                    value={relationName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFieldValue("relationName", e.target.value)
                    }
                    label={"Relation name"}
                    disabled={disabled}
                    error={showErrors && !relationName}
                />
                <FieldCaption error={showErrors && !relationName}>
                    {showErrors && !relationName
                        ? "Required"
                        : "Identifier for this relation (used to link the property to the relation config)"}
                </FieldCaption>
            </div>

            {/* ─── Cardinality ─── */}
            <div className={"col-span-12 sm:col-span-6"}>
                <Select
                    value={cardinality}
                    onValueChange={(v) => updateRelationConfig({ cardinality: v })}
                    label={"Cardinality"}
                    disabled={disabled}
                    fullWidth
                    renderValue={(v) => v === "one" ? "One (has-one)" : "Many (has-many)"}
                >
                    <SelectItem value={"one"}>
                        <div>
                            <Typography variant={"body2"}>One (has-one)</Typography>
                            <Typography variant={"caption"} color={"secondary"}>
                                This property references a single record
                            </Typography>
                        </div>
                    </SelectItem>
                    <SelectItem value={"many"}>
                        <div>
                            <Typography variant={"body2"}>Many (has-many)</Typography>
                            <Typography variant={"caption"} color={"secondary"}>
                                This property references multiple records
                            </Typography>
                        </div>
                    </SelectItem>
                </Select>
                <FieldCaption>
                    Whether the relation returns one or multiple records
                </FieldCaption>
            </div>

            {/* ─── Direction ─── */}
            <div className={"col-span-12 sm:col-span-6"}>
                <Select
                    value={direction}
                    onValueChange={(v) => updateRelationConfig({ direction: v })}
                    label={"Direction"}
                    disabled={disabled}
                    fullWidth
                    renderValue={(v) => v === "owning" ? "Owning" : "Inverse"}
                >
                    <SelectItem value={"owning"}>
                        <div>
                            <Typography variant={"body2"}>Owning</Typography>
                            <Typography variant={"caption"} color={"secondary"}>
                                This table stores the foreign key (or owns the junction table)
                            </Typography>
                        </div>
                    </SelectItem>
                    <SelectItem value={"inverse"}>
                        <div>
                            <Typography variant={"body2"}>Inverse</Typography>
                            <Typography variant={"caption"} color={"secondary"}>
                                The target table stores the foreign key pointing back here
                            </Typography>
                        </div>
                    </SelectItem>
                </Select>
                <FieldCaption>
                    Which side of the relation owns the persistence
                </FieldCaption>
            </div>

            {/* ─── Local Key (owning + one) ─── */}
            {showLocalKey && (
                <div className={"col-span-12"}>
                    <TextField
                        value={localKey}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                            updateRelationConfig({ localKey: e.target.value })
                        }
                        label={"Local key (foreign key column on this table)"}
                        disabled={disabled}
                        placeholder={"e.g. author_id"}
                    />
                    <FieldCaption>
                        Column on this table that references the target's primary key
                    </FieldCaption>
                </div>
            )}

            {/* ─── Foreign Key on Target (inverse) ─── */}
            {showForeignKey && (
                <div className={"col-span-12"}>
                    <TextField
                        value={foreignKeyOnTarget}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                            updateRelationConfig({ foreignKeyOnTarget: e.target.value })
                        }
                        label={"Foreign key on target table"}
                        disabled={disabled}
                        placeholder={"e.g. post_id"}
                    />
                    <FieldCaption>
                        Column on the target table that references this table's primary key
                    </FieldCaption>
                </div>
            )}

            {/* ─── Junction Table (many + owning) ─── */}
            {showThrough && (
                <div className={"col-span-12"}>
                    <Typography variant={"label"} className={"mb-2"}>
                        Junction table (many-to-many)
                    </Typography>
                    <div className={"grid grid-cols-12 gap-4"}>
                        <div className={"col-span-12"}>
                            <TextField
                                value={throughTable}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                    updateThrough({ table: e.target.value })
                                }
                                label={"Junction table name"}
                                disabled={disabled}
                                placeholder={"e.g. user_roles"}
                            />
                            <FieldCaption>
                                Name of the intermediate table that connects both collections
                            </FieldCaption>
                        </div>
                        <div className={"col-span-12 sm:col-span-6"}>
                            <TextField
                                value={throughSourceColumn}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                    updateThrough({ sourceColumn: e.target.value })
                                }
                                label={"Source column"}
                                disabled={disabled}
                                placeholder={"e.g. user_id"}
                            />
                            <FieldCaption>
                                Column in the junction table referencing this table
                            </FieldCaption>
                        </div>
                        <div className={"col-span-12 sm:col-span-6"}>
                            <TextField
                                value={throughTargetColumn}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                    updateThrough({ targetColumn: e.target.value })
                                }
                                label={"Target column"}
                                disabled={disabled}
                                placeholder={"e.g. role_id"}
                            />
                            <FieldCaption>
                                Column in the junction table referencing the target table
                            </FieldCaption>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Cascade Actions ─── */}
            <div className={"col-span-12 sm:col-span-6"}>
                <Select
                    value={onUpdate}
                    onValueChange={(v) => updateRelationConfig({ onUpdate: v })}
                    label={"On update"}
                    disabled={disabled}
                    fullWidth
                    renderValue={(v) => String(v)}
                >
                    {ON_ACTION_OPTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                            {action}
                        </SelectItem>
                    ))}
                </Select>
                <FieldCaption>
                    Action when the referenced record is updated
                </FieldCaption>
            </div>

            <div className={"col-span-12 sm:col-span-6"}>
                <Select
                    value={onDelete}
                    onValueChange={(v) => updateRelationConfig({ onDelete: v })}
                    label={"On delete"}
                    disabled={disabled}
                    fullWidth
                    renderValue={(v) => String(v)}
                >
                    {ON_ACTION_OPTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                            {action}
                        </SelectItem>
                    ))}
                </Select>
                <FieldCaption>
                    Action when the referenced record is deleted
                </FieldCaption>
            </div>
        </>
    );
}
