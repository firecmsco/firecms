import { EntityCallbacks, FireCMSContext, User } from "@firecms/core";
import equal from "react-fast-compare"
import { HistoryEntry, NewHistoryEntryParams } from "./types";



export function createHistoryEntry<T = any>({
    context,
    previousValues,
    values,
    path,
    entityId,
    collection
}: NewHistoryEntryParams<T>) {

    const uid = context.authController.user?.uid;
    const dataSource = context.dataSource;
    const changedFields = previousValues ? findChangedFields(previousValues as object, values as object) : null;

    const entry: HistoryEntry<T> = {
        ...values,
        __metadata: {
            previous_values: previousValues,
            changed_fields: changedFields,
            updated_on: new Date(),
            updated_by: uid ?? null,
        }
    };
    dataSource.saveEntity({
        path: path + "/" + entityId + "/__history",
        values: entry,
        status: "new",
        collection
    }).then(() => {
        console.debug("History saved for", path, entityId);
    });
}

export const entityHistoryCallbacks: EntityCallbacks = {
    onSaveSuccess: async (props) => {

        const values = props.values;
        const previousValues = props.previousValues;
        const path = props.path;
        const entityId = props.entityId;
        const context = props.context;
        const collection = props.collection;
        createHistoryEntry({
            context: context,
            previousValues: previousValues,
            values: values,
            path: path,
            entityId: entityId,
            collection: collection
        });
    }
}

function findChangedFields<M extends object>(oldValues: M, newValues: M, prefix: string = ""): string[] {
    const changedFields: string[] = [];

    // Handle null/undefined cases
    if (equal(oldValues, newValues)) return changedFields;
    if (!oldValues || !newValues) return [prefix || "."];

    // Get all unique keys from both objects
    const allKeys = new Set([
        ...Object.keys(oldValues),
        ...Object.keys(newValues)
    ]);

    for (const key of allKeys) {
        const oldValue = oldValues[key as keyof M];
        const newValue = newValues[key as keyof M];
        const currentPath = prefix ? `${prefix}.${key}` : key;

        // If key exists only in one object
        if ((key in oldValues) !== (key in newValues)) {
            changedFields.push(currentPath);
            continue;
        }

        // If values are identical (deep equality)
        if (equal(oldValue, newValue)) continue;

        // Handle arrays
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            if (oldValue.length !== newValue.length) {
                changedFields.push(currentPath);
            } else {
                // Check if any array element changed
                for (let i = 0; i < oldValue.length; i++) {
                    if (
                        typeof oldValue[i] === "object" && oldValue[i] !== null &&
                        typeof newValue[i] === "object" && newValue[i] !== null
                    ) {
                        const nestedChanges = findChangedFields(
                            oldValue[i] as object,
                            newValue[i] as object,
                            `${currentPath}[${i}]`
                        );
                        if (nestedChanges.length > 0) {
                            changedFields.push(currentPath);
                            break;
                        }
                    } else if (!equal(oldValue[i], newValue[i])) {
                        changedFields.push(currentPath);
                        break;
                    }
                }
            }
        }
        // Handle nested objects
        else if (
            typeof oldValue === "object" && oldValue !== null &&
            typeof newValue === "object" && newValue !== null
        ) {
            const nestedChanges = findChangedFields(
                oldValue as object,
                newValue as object,
                currentPath
            );
            changedFields.push(...nestedChanges);
        }
        // Handle primitives
        else {
            changedFields.push(currentPath);
        }
    }

    return changedFields;
}
