import * as Yup from "yup";

export const YupSchema = Yup.object().shape({
    id: Yup.string().required("Required"),
    name: Yup.string().required("Required"),
    path: Yup.string().required("Required")
});
