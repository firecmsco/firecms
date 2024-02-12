export const unslugify = (slug: string): string => {
    const result = slug.replace(/[-_]/g, " ");
    return result.charAt(0).toUpperCase() + result.substr(1).toLowerCase();
    // return result.replace(/\w\S*/g, function (txt) {
    //     return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    // });
}
