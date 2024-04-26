export function extractStringLiterals(code: string) {
    const regex = /["']([^"']+)["']/g;
    let match;
    const literals = [];

    while ((match = regex.exec(code)) !== null) {
        literals.push(match[1]);
    }

    return literals;
}
