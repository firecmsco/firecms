import React, { useContext } from "react";
import { FormexController } from "./types";

const FormexContext = React.createContext<FormexController<any>>({} as any);

export const useFormex = <T extends object>() => useContext<FormexController<T>>(FormexContext);

export const Formex = ({ value, children }: { value: FormexController<any>, children: React.ReactNode }) => {
    return <FormexContext.Provider value={value}>{children}</FormexContext.Provider>;
};
