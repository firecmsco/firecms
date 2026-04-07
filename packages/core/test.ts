interface Base {
    type: string;
}
interface UI {
    Field: any;
}
interface Str extends Base {
    type: "string";
    validation: any;
}
type CMSStr = Str & UI;
const c: Omit<CMSStr, "name"> & { name?: string } = {
    type: "string",
    validation: {},
    Field: null
};
