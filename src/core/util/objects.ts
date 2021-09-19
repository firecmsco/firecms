export const pick: <T>(obj: T, ...args: any[]) => T = (obj: any, ...args: any[]) => ({
    ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
});
