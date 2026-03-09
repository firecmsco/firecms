import { mergeDeep } from "./packages/common/src/util/objects.js";
import { buildPropertyCallbacks } from "./packages/common/src/util/callbacks.js";

const obj1 = { name: "test", email: "   delete@me.com  " };
const obj2 = { name: "test", email: "delete@me.com" };
console.log("MergeDeep string update:", mergeDeep(obj1, obj2));

const props = {
    email: {
        type: "string",
        callbacks: {
            beforeSave: ({ value }: any) => {
                console.log("Testing Property Callback: email beforeSave", value);
                return value?.trim();
            }
        }
    }
};

const cb = buildPropertyCallbacks(props as any);
if (cb?.beforeSave) {
    cb.beforeSave({ values: obj1, previousValues: undefined, context: {} } as any).then((res) => {
        console.log("ProcessProperties result:", res);
        console.log("Final merged:", mergeDeep(obj1, res));
    });
}
