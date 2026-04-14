import { z } from "zod";

export const CollectionEditorSchema = z.object({
    slug: z.string().min(1, "Required"),
    name: z.string().min(1, "Required"),
    table: z.string().min(1, "Required"),
});


