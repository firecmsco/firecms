export function keyToIconComponent(key: string) {
    const startsWithNumber = key.match(/^\d/);

    // convert key to came case
    const componentName = (startsWithNumber ? "_" : "") +
        key.split("_").map((word: string) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join("") +
        "Icon";
    return componentName;
}
