import React, { useContext } from "react";
import { FormexController } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormexContext = React.createContext<FormexController<any> | null>(null);

export const useFormex = <T extends object>() => {
    const ctx = useContext(FormexContext);
    if (!ctx) throw new Error("useFormex must be used within a Formex provider");
    return ctx as FormexController<T>;
};

export const Formex = <T extends object>({ value, children }: { value: FormexController<T>, children: React.ReactNode }) => {
    return <FormexContext.Provider value={value}>{children}</FormexContext.Provider>;
};
