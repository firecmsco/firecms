import React, { useContext } from "react";
import { FormexController } from "./types.js";

const FormexContext = React.createContext<FormexController<any>>({} as any);

export const useFormex = <T extends object>() => useContext<FormexController<T>>(FormexContext);

export const Formex = FormexContext.Provider;
