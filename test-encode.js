function removeInitialAndTrailingSlashes(input) {
    return input.replace(/^\/+|\/+$/g, '');
}

function encodePath(input) {
    const cleanInput = removeInitialAndTrailingSlashes(input);
    const [pathPart, rest] = cleanInput.split("?", 2);
    
    let encodedPath = encodeURIComponent(pathPart).replaceAll("%2F", "/");
    let result = encodedPath;

    if (rest !== undefined) {
        const [searchPart, hashPart] = rest.split("#", 2);
        result += `?${searchPart}`;
        if (hashPart !== undefined) {
            result += `#${hashPart}`;
        }
    } else {
        const [pathOnly, hashOnly] = cleanInput.split("#", 2);
        if (hashOnly !== undefined) {
            encodedPath = encodeURIComponent(pathOnly).replaceAll("%2F", "/");
            result = `${encodedPath}#${hashOnly}`;
        }
    }
    
    return result;
}

console.log(encodePath("products/B00BZQPQLQ?category_op=%3D%3D&category_value=babys#side"));
console.log(encodePath("products/B00BZQPQLQ#side"));
console.log(encodePath("products/B00BZQPQLQ"));
console.log(encodePath("/products/B00BZQPQLQ/?category_op=%3D%3D&category_value=babys"));
