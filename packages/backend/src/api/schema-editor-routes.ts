import { Router, Request, Response } from "express";
import { AstSchemaEditor } from "./ast-schema-editor";

export function createSchemaEditorRoutes(collectionsDir: string): Router {
    const router = Router();
    const editor = new AstSchemaEditor(collectionsDir);

    router.post("/property/save", async (req: Request, res: Response) => {
        try {
            const { collectionId, propertyKey, propertyConfig } = req.body;
            await editor.saveProperty(collectionId, propertyKey, propertyConfig);
            res.json({ success: true });
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    router.post("/property/delete", async (req: Request, res: Response) => {
        try {
            const { collectionId, propertyKey } = req.body;
            await editor.deleteProperty(collectionId, propertyKey);
            res.json({ success: true });
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    router.post("/collection/save", async (req: Request, res: Response) => {
        try {
            const { collectionId, collectionData } = req.body;
            await editor.saveCollection(collectionId, collectionData);
            res.json({ success: true });
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    router.post("/collection/delete", async (req: Request, res: Response) => {
        try {
            const { collectionId } = req.body;
            await editor.deleteCollection(collectionId);
            res.json({ success: true });
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    return router;
}
