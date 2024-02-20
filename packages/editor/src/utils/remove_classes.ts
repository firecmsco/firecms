export function removeClassesFromJson(jsonObj: any): any {
    // If it's an array, apply the function to each element
    if (Array.isArray(jsonObj)) {
        return jsonObj.map(item => removeClassesFromJson(item));
    } else if (typeof jsonObj === "object" && jsonObj !== null) { // If it's an object, recurse through its properties
        // If the object has an `attrs` property and `class` field, delete the `class` field
        if (jsonObj.attrs && typeof jsonObj.attrs === "object" && "class" in jsonObj.attrs) {
            delete jsonObj.attrs.class;
        }

        // Apply the function recursively to object properties
        Object.keys(jsonObj).forEach(key => {
            jsonObj[key] = removeClassesFromJson(jsonObj[key]);
        });
    }
    return jsonObj;
}
