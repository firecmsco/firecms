export const unslugify = (slug: string): string => {
    const result = slug.replace(/[-_]/g, " ");
    return result.charAt(0).toUpperCase() + result.substr(1).toLowerCase();
    // return result.replace(/\w\S*/g, function (txt) {
    //     return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    // });
}

export function camelCase(str: string): string {
    return (str.slice(0, 1).toLowerCase() + str.slice(1))
        .replace(/([-_ ]){1,}/g, ' ')
        .split(/[-_ ]/)
        .reduce((cur, acc) => {
            return cur + acc[0].toUpperCase() + acc.substring(1);
        });
}
