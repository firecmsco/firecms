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
