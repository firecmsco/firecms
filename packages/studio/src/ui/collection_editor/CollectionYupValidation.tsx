import { z } from "zod";

export const CollectionEditorSchema = z.object({
    slug: z.string().min(1, "Required"),
    name: z.string().min(1, "Required"),
    dbPath: z.string().min(1, "Required")
});

/**
 * @deprecated Use CollectionEditorSchema instead
 */
export const YupSchema = CollectionEditorSchema;
