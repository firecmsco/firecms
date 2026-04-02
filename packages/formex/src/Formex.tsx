import React, { useContext } from "react";
import { FormexController } from "./types";

const FormexContext = React.createContext<FormexController<Record<string, unknown>> | null>(null);

export const useFormex = <T extends object>() => {
    const ctx = useContext(FormexContext);
    if (!ctx) throw new Error("useFormex must be used within a Formex provider");
    return ctx as unknown as FormexController<T>;
};

export const Formex = ({ value, children }: { value: FormexController<Record<string, unknown>>, children: React.ReactNode }) => {
    return <FormexContext.Provider value={value}>{children}</FormexContext.Provider>;
};
