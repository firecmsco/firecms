const kebabCaseRegex = /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g;

export const toKebabCase = (str: string) => {
    const regExpMatchArray = str.match(kebabCaseRegex);
    if (!regExpMatchArray) return "";
    return regExpMatchArray
        .map(x => x.toLowerCase())
        .join("-");
};

const snakeCaseRegex = /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g;

export const toSnakeCase = (str: string) => {
    const regExpMatchArray = str.match(snakeCaseRegex);
    if (!regExpMatchArray) return "";
    return regExpMatchArray
        .map(x => x.toLowerCase())
        .join("_");
};

export function randomString(strLength = 5) {
    return Math.random().toString(36).slice(2, 2 + strLength);
}

export function randomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

export function slugify(text?: string, separator = "_", lowercase = true) {
    if (!text) return "";
    const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;-"
    const to = `aaaaaeeeeeiiiiooooouuuunc${separator}${separator}${separator}${separator}${separator}${separator}${separator}`;

    for (let i = 0, l = from.length; i < l; i++) {
        text = text.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    text = text
        .toString() // Cast to string
        .replace(/\s+/g, separator) // Replace spaces with separator
        .replace(/&/g, separator) // Replace & with separator
        .replace(/[^\w\\-]+/g, "") // Remove all non-word chars
        .replace(new RegExp("\\" + separator + "\\" + separator + "+", "g"),
            separator) // Replace multiple separators with single one
        .trim() // Remove whitespace from both sides of a string
        .replace(/^\s+|\s+$/g, "");

    return lowercase
        ? text.toLowerCase() // Convert the string to lowercase letters
        : text;
}

export function unslugify(slug?: string): string {
    if (!slug) return "";
    if (slug.includes("-") || slug.includes("_") || !slug.includes(" ")) {
        const result = slug.replace(/[-_]/g, " ");
        return result.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1);
        }).trim();
    } else {
        return slug.trim();
    }
}

export function prettifyIdentifier(input: string) {
    if (!input) return "";

    let text = input;

    // 1. Handle camelCase and Acronyms
    // Group 1 ($1 $2): Lowercase followed by Uppercase (e.g., imageURL -> image URL)
    // Group 2 ($3 $4): Uppercase followed by Uppercase+lowercase (e.g., XMLParser -> XML Parser)
    text = text.replace(/([a-z])([A-Z])|([A-Z])([A-Z][a-z])/g, "$1$3 $2$4");

    // 2. Replace hyphens/underscores with spaces
    text = text.replace(/[_-]+/g, " ");

    // 3. Capitalize first letter of each word (Title Case)
    return text
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
