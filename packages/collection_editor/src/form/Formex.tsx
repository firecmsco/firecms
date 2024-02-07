import React, { useContext } from "react";
import { FormexController } from "./types";

const FormexContext = React.createContext<FormexController<any>>({} as any);

export const useFormex = () => useContext<FormexController<any>>(FormexContext);

export const Formex = FormexContext.Provider;
