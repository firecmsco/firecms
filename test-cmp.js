function findChangedFields(
    oldValues,
    newValues
) {
    const changed = [];
    const allKeys = new Set([
        ...Object.keys(oldValues),
        ...Object.keys(newValues)
    ]);

    for (const key of allKeys) {
        const oldVal = oldValues[key];
        const newVal = newValues[key];

        if (key.startsWith("__")) continue;

        if (oldVal !== newVal) {
            if (
                typeof oldVal === "object" && oldVal !== null &&
                typeof newVal === "object" && newVal !== null
            ) {
                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                    changed.push(key);
                }
            } else {
                changed.push(key);
            }
        }
    }

    return changed.length > 0 ? changed : null;
}

const oldRel = { "id": "1", "path": "authors", "__type": "relation", "data": { "id": "1" } };
const newRel = { "id": "2", "path": "authors", "__type": "relation", "data": { "id": "2" } };

console.log(findChangedFields({ author: oldRel }, { author: newRel }));

const oldArr = [oldRel];
const newArr = [newRel];

console.log(findChangedFields({ tags: oldArr }, { tags: newArr }));
