import * as Yup from "yup";

export const YupSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    path: Yup.string().required("Required")
});
