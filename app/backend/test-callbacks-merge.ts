import { buildPropertyCallbacks, mergeCallbacks } from "@rebasepro/common";
import authors from "../shared/collections/authors";

const propertyCallbacks = buildPropertyCallbacks(authors.properties);
const merged = mergeCallbacks(authors.callbacks, propertyCallbacks);

console.log("has beforeSave:", !!merged?.beforeSave);

if (merged?.beforeSave) {
    merged.beforeSave({
        values: { name: "Hello", email: "  test@test.com  " },
        previousValues: {},
        collection: authors as any,
        path: "authors",
        entityId: "123",
        status: "new",
        context: {} as any
    }).then((res: any) => console.log("Result:", res));
}
