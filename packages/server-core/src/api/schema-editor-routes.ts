import { Hono } from "hono";
import { AstSchemaEditor } from "./ast-schema-editor";
import { HonoEnv } from "./types";

export function createSchemaEditorRoutes(collectionsDir: string): Hono<HonoEnv> {
    const router = new Hono<HonoEnv>();
    const editor = new AstSchemaEditor(collectionsDir);

    router.post("/property/save", async (c) => {
        const body = await c.req.json();
        const { collectionId, propertyKey, propertyConfig } = body;
        await editor.saveProperty(collectionId, propertyKey, propertyConfig);
        return c.json({ success: true });
    });

    router.post("/property/delete", async (c) => {
        const body = await c.req.json();
        const { collectionId, propertyKey } = body;
        await editor.deleteProperty(collectionId, propertyKey);
        return c.json({ success: true });
    });

    router.post("/collection/save", async (c) => {
        const body = await c.req.json();
        const { collectionId, collectionData } = body;
        await editor.saveCollection(collectionId, collectionData);
        return c.json({ success: true });
    });

    router.post("/collection/delete", async (c) => {
        const body = await c.req.json();
        const { collectionId } = body;
        await editor.deleteCollection(collectionId);
        return c.json({ success: true });
    });

    return router;
}

