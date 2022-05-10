import { EntityCollection } from "@camberi/firecms";

export type SassEntityCollection = EntityCollection & {
    /**
     * Can this entity collection be edited with the inline editor.
     * It defaults to `true`
     */
    editable?: boolean;

    /**
     * Can this entity collection be deleted.
     */
    deletable?: boolean
}
