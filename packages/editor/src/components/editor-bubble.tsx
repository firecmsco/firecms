import { useCurrentEditor } from "@tiptap/react";
import { forwardRef, type ReactNode, useMemo } from "react";
// @ts-ignore
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/react/menus";
import { NodeSelection } from "@tiptap/pm/state";

export interface EditorBubbleProps extends Omit<BubbleMenuProps, "editor"> {
    children: ReactNode;
    // Temporary backward-compat: map v2 tippyOptions.placement -> v3 options.placement
    tippyOptions?: { placement?: any };
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
    ({ children, tippyOptions, options, ...rest }, ref) => {
        const { editor } = useCurrentEditor();

        const bubbleMenuProps: Omit<BubbleMenuProps, "editor" | "children"> = useMemo(() => {
            const shouldShow: BubbleMenuProps["shouldShow"] = ({ editor, state }:any) => {
                const { selection } = state;
                const { empty } = selection as any;

                // don't show bubble menu if:
                // - the selected node is an image
                // - the selection is empty
                // - the selection is a node selection (for drag handles)
                if (editor.isActive("image") || empty || selection instanceof NodeSelection) {
                    return false;
                }
                return true;
            };

            const mergedOptions = {
                ...options,
                // map deprecated tippy placement if provided
                placement: tippyOptions?.placement ?? options?.placement,
            } as BubbleMenuProps["options"];

            return {
                shouldShow,
                options: mergedOptions,
                ...rest,
            };
        }, [rest, options, tippyOptions?.placement]);

        if (!editor) return null;

        return (
            // We need to add this because of https://github.com/ueberdosis/tiptap/issues/2658
            <div ref={ref}>
                <BubbleMenu editor={editor} {...bubbleMenuProps}>
                    {children}
                </BubbleMenu>
            </div>
        );
    }
);

export default EditorBubble;
