import { forwardRef, type ReactNode, useMemo } from "react";
import { EditorProvider, type EditorProviderProps, type JSONContent } from "@tiptap/react";
import { createStore, Provider } from "jotai";
import { simpleExtensions } from "../extensions";

export interface EditorProps {
    children: ReactNode;
    className?: string;
}

export const novelStore = createStore();

export const EditorRoot = ({ children }: { children: ReactNode }): JSX.Element => {
    return <Provider store={novelStore}>{children}</Provider>;
};

export type EditorContentProps = {
    children: ReactNode;
    className?: string;
    initialContent?: JSONContent | string;
} & Omit<EditorProviderProps, "content">;

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
    ({ className, children, initialContent, ...rest }, ref) => {
        const extensions = useMemo(() => {
            return [...simpleExtensions, ...(rest.extensions ?? [])];
        }, [rest.extensions]);

        return (
            <div ref={ref} className={className}>
                <EditorProvider {...rest} content={initialContent} extensions={extensions}>
                    {children}
                </EditorProvider>
            </div>
        );
    }
);

EditorContent.displayName = "EditorContent";
