import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export interface HistoryEntry {
    id: string;
    table_name: string;
    entity_id: string;
    action: "create" | "update" | "delete";
    changed_fields: string[] | null;
    values: Record<string, unknown> | null;
    previous_values: Record<string, unknown> | null;
    updated_by: string | null;
    updated_at: string;
}

export interface RecordHistoryParams {
    tableName: string;
    entityId: string;
    action: "create" | "update" | "delete";
    values?: Record<string, unknown> | null;
    previousValues?: Record<string, unknown> | null;
    updatedBy?: string | null;
}

export interface FetchHistoryOptions {
    limit?: number;
    offset?: number;
}

/**
 * Service for recording and querying entity change history.
 * Stores snapshots in the `rebase.entity_history` table.
 */
export class HistoryService {
    constructor(private db: NodePgDatabase) {}

    /**
     * Record a history entry for an entity change.
     * This is intentionally fire-and-forget safe — errors are logged but never
     * bubble up to block the main save/delete operation.
     */
    async recordHistory(params: RecordHistoryParams): Promise<void> {
        const {
            tableName,
            entityId,
            action,
            values,
            previousValues,
            updatedBy
        } = params;

        const changedFields = previousValues && values
            ? findChangedFields(previousValues, values)
            : null;

        try {
            await this.db.execute(sql`
                INSERT INTO rebase.entity_history 
                    (table_name, entity_id, action, changed_fields, "values", previous_values, updated_by)
                VALUES (
                    ${tableName},
                    ${String(entityId)},
                    ${action},
                    ${changedFields ? sql`${changedFields}::text[]` : sql`NULL`},
                    ${values ? sql`${JSON.stringify(values)}::jsonb` : sql`NULL`},
                    ${previousValues ? sql`${JSON.stringify(previousValues)}::jsonb` : sql`NULL`},
                    ${updatedBy ?? null}
                )
            `);
        } catch (error) {
            console.error("Failed to record entity history:", error);
        }
    }

    /**
     * Fetch history entries for an entity, ordered by most recent first.
     */
    async fetchHistory(
        tableName: string,
        entityId: string,
        options: FetchHistoryOptions = {}
    ): Promise<{ data: HistoryEntry[]; total: number }> {
        const limit = options.limit ?? 20;
        const offset = options.offset ?? 0;

        const [countResult, dataResult] = await Promise.all([
            this.db.execute(sql`
                SELECT COUNT(*) as count
                FROM rebase.entity_history
                WHERE table_name = ${tableName}
                  AND entity_id = ${String(entityId)}
            `),
            this.db.execute(sql`
                SELECT id, table_name, entity_id, action, changed_fields,
                       "values", previous_values, updated_by, updated_at
                FROM rebase.entity_history
                WHERE table_name = ${tableName}
                  AND entity_id = ${String(entityId)}
                ORDER BY updated_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `)
        ]);

        const total = parseInt(
            (countResult.rows[0] as Record<string, string>)?.count ?? "0",
            10
        );

        return {
            data: dataResult.rows as unknown as HistoryEntry[],
            total
        };
    }

    /**
     * Fetch a single history entry by ID.
     */
    async fetchHistoryEntry(historyId: string): Promise<HistoryEntry | null> {
        const result = await this.db.execute(sql`
            SELECT id, table_name, entity_id, action, changed_fields,
                   "values", previous_values, updated_by, updated_at
            FROM rebase.entity_history
            WHERE id = ${historyId}
        `);

        if (result.rows.length === 0) return null;
        return result.rows[0] as unknown as HistoryEntry;
    }
}


/**
 * Shallow comparison to find top-level keys that changed between two objects.
 */
function findChangedFields(
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
): string[] {
    const changed: string[] = [];
    const allKeys = new Set([
        ...Object.keys(oldValues),
        ...Object.keys(newValues)
    ]);

    for (const key of allKeys) {
        const oldVal = oldValues[key];
        const newVal = newValues[key];

        // Skip internal metadata
        if (key.startsWith("__")) continue;

        if (oldVal !== newVal) {
            // For objects/arrays, use JSON comparison
            if (
                typeof oldVal === "object" && oldVal !== null &&
                typeof newVal === "object" && newVal !== null
            ) {
                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                    changed.push(key);
                }
            } else {
                changed.push(key);
            }
        }
    }

    return changed;
}
