import * as Yup from "yup";

export const YupSchema = Yup.object().shape({
    slug: Yup.string().required("Required"),
    name: Yup.string().required("Required"),
    dbPath: Yup.string().required("Required")
});
