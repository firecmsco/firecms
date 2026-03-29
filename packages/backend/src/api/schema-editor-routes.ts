import { Router, Request, Response } from "express";
import { AstSchemaEditor } from "./ast-schema-editor";
import { ApiError, asyncHandler } from "./errors";

export function createSchemaEditorRoutes(collectionsDir: string): Router {
    const router = Router();
    const editor = new AstSchemaEditor(collectionsDir);

    router.post("/property/save", asyncHandler(async (req: Request, res: Response) => {
        const { collectionId, propertyKey, propertyConfig } = req.body;
        await editor.saveProperty(collectionId, propertyKey, propertyConfig);
        res.json({ success: true });
    }));

    router.post("/property/delete", asyncHandler(async (req: Request, res: Response) => {
        const { collectionId, propertyKey } = req.body;
        await editor.deleteProperty(collectionId, propertyKey);
        res.json({ success: true });
    }));

    router.post("/collection/save", asyncHandler(async (req: Request, res: Response) => {
        const { collectionId, collectionData } = req.body;
        await editor.saveCollection(collectionId, collectionData);
        res.json({ success: true });
    }));

    router.post("/collection/delete", asyncHandler(async (req: Request, res: Response) => {
        const { collectionId } = req.body;
        await editor.deleteCollection(collectionId);
        res.json({ success: true });
    }));

    return router;
}
