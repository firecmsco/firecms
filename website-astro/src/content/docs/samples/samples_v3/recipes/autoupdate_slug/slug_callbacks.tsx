import { EntityCallbacks, slugify } from "@rebasepro/core";

const callbacks: EntityCallbacks = {
    beforeSave: ({
        collection,
        path,
        entityId,
        values,
        status,
        context
    }) => {
        const updatedSlug = slugify(values.title);
        values.slug = updatedSlug;
        return values;
    }
};
