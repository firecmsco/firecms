import { useEditor } from "../components";
import { useEffect, useRef, } from "react";
import { Button, CheckIcon, cn, DeleteIcon, Popover } from "@firecms/ui";

export function isValidUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export function getUrlFromString(str: string) {
    if (isValidUrl(str)) return str;
    try {
        if (str.includes(".") && !str.includes(" ")) {
            return new URL(`https://${str}`).toString();
        }
        return null;
    } catch (e) {
        return null;
    }
}

interface LinkSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({
                                 open,
                                 onOpenChange
                             }: LinkSelectorProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { editor } = useEditor();

    // Autofocus on input by default
    useEffect(() => {
        inputRef.current && inputRef.current?.focus();
    });
    if (!editor) return null;

    return (
        <Popover modal={true}
                 open={open}
                 onOpenChange={onOpenChange}
                 trigger={<Button variant="text"
                                  className="gap-2 rounded-none"
                                  color={"text"}>
                     {/*<p className="text-base">↗</p>*/}
                     <p className={cn("underline decoration-stone-400 underline-offset-4", {
                         "text-blue-500": editor.isActive("link"),
                     })}
                     >
                         Link
                     </p>
                 </Button>}>
            <form
                onSubmit={(e) => {
                    const target = e.currentTarget as HTMLFormElement;
                    e.preventDefault();
                    const input = target[0] as HTMLInputElement;
                    const url = getUrlFromString(input.value);
                    url && editor.chain().focus().setLink({ href: url }).run();
                }}
                className="flex  p-1 "
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Paste a link"
                    className="flex-1 bg-white dark:bg-gray-900 p-1 text-sm outline-none"
                    defaultValue={editor.getAttributes("link").href || ""}
                />
                {editor.getAttributes("link").href ? (
                    <Button
                        size="small"
                        variant="outlined"
                        type="button"
                        className="flex h-8 items-center rounded p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
                        onClick={() => {
                            editor.chain().focus().unsetLink().run();
                        }}
                    >
                        <DeleteIcon className="h-4 w-4"/>
                    </Button>
                ) : (
                    <Button size="small" className="h-8">
                        <CheckIcon className="h-4 w-4"/>
                    </Button>
                )}
            </form>
        </Popover>
    );
};
