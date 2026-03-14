import { buildPropertyCallbacks } from "@rebasepro/common";
import authors from "../shared/collections/authors";

const callbacks = buildPropertyCallbacks(authors.properties);
console.log("has beforeSave:", !!callbacks?.beforeSave);

if (callbacks?.beforeSave) {
    callbacks.beforeSave({
        values: { name: "Hello", email: "  test@test.com  " },
        previousValues: {},
        collection: authors as any,
        path: "authors",
        entityId: "123",
        status: "new",
        context: {} as any
    }).then((res: any) => console.log("Result:", res));
}
