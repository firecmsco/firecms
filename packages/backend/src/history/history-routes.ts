import { Hono } from "hono";
import { HonoEnv } from "../api/types";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";
import { ApiError } from "../api/errors";
import { DataDriver } from "@rebasepro/types";
/**
 * Create Hono routes for entity history.
 * Mounted at `{basePath}/data/:slug/:entityId/history`.
 */
export function createHistoryRoutes(params: {
    historyService: any;
    registry: BackendCollectionRegistry;
    driver: DataDriver;
}): Hono<HonoEnv> {
    const { historyService, registry, driver } = params;
    const router = new Hono<HonoEnv>();

    /**
     * GET /:slug/:entityId/history - List history entries for an entity
     *
     * Query params:
     *   limit  (default 20)
     *   offset (default 0)
     */
    router.get("/:slug/:entityId/history", async (c) => {
        const slug = c.req.param("slug");
        const entityId = c.req.param("entityId");
        const parsedLimit = parseInt(c.req.query("limit") ?? "20", 10);
        const parsedOffset = parseInt(c.req.query("offset") ?? "0", 10);
        const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit;
        const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;

        // Resolve the collection to get the actual table name
        const collection = registry.getCollections().find(
            col => col.slug === slug || col.dbPath === slug
        );

        if (!collection) {
            throw ApiError.notFound(`Collection '${slug}' not found`);
        }

        if (!collection.history) {
            throw ApiError.badRequest(`History is not enabled for collection '${slug}'`);
        }

        const tableName = collection.dbPath || collection.slug;

        const result = await historyService.fetchHistory(tableName, entityId, {
            limit: Math.min(limit, 100),
            offset: Math.max(offset, 0)
        });

        return c.json({
            data: result.data,
            meta: {
                total: result.total,
                limit,
                offset,
                hasMore: offset + result.data.length < result.total
            }
        });
    });

    /**
     * POST /:slug/:entityId/history/:historyId/revert - Revert entity to a historical version
     *
     * This goes through the normal save path, so it creates its own history entry.
     */
    router.post("/:slug/:entityId/history/:historyId/revert", async (c) => {
        const slug = c.req.param("slug");
        const entityId = c.req.param("entityId");
        const historyId = c.req.param("historyId");

        const collection = registry.getCollections().find(
            col => col.slug === slug || col.dbPath === slug
        );

        if (!collection) {
            throw ApiError.notFound(`Collection '${slug}' not found`);
        }

        if (!collection.history) {
            throw ApiError.badRequest(`History is not enabled for collection '${slug}'`);
        }

        // Fetch the history entry
        const historyEntry = await historyService.fetchHistoryEntry(historyId);

        if (!historyEntry) {
            throw ApiError.notFound(`History entry '${historyId}' not found`);
        }

        // Verify the history entry belongs to this entity (prevent cross-entity revert)
        const tableName = collection.dbPath || collection.slug;
        if (historyEntry.entity_id !== String(entityId) || historyEntry.table_name !== tableName) {
            throw ApiError.badRequest("History entry does not belong to this entity");
        }

        if (!historyEntry.values) {
            throw ApiError.badRequest("Cannot revert: history entry has no stored values");
        }

        // Revert by saving through the normal driver path — this will
        // itself create another history entry, giving a full audit trail.
        const authDriver = c.get("driver") || driver;
        const path = collection.dbPath || collection.slug;

        const savedEntity = await authDriver.saveEntity({
            path,
            entityId: String(entityId),
            values: historyEntry.values,
            collection,
            status: "existing"
        });

        return c.json({
            data: savedEntity,
            meta: { reverted_from: historyId }
        });
    });

    return router;
}
