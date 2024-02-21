import { type ReactNode } from "react";
import { createStore, Provider } from "jotai";

export const editorStore = createStore();

export const EditorRoot = ({ children }: { children: ReactNode }): JSX.Element => {
    return <Provider store={editorStore}>{children}</Provider>;
};
