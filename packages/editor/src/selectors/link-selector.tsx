import { useEditor } from "../components";
import { useEffect, useRef, } from "react";
import { Button, CheckIcon, cls, DeleteIcon, Popover } from "@firecms/ui";

export function isValidUrl(url: string) {
    try {
        // eslint-disable-next-line no-new
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
                     <p className={cls("underline decoration-stone-400 underline-offset-4", {
                         "text-blue-500": editor.isActive("link"),
                     })}>
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
                className="flex p-1"
            >
                <input
                    ref={inputRef}
                    autoFocus={open}
                    placeholder="Paste a link"
                    defaultValue={editor.getAttributes("link").href || ""}
                    className={"text-gray-900 dark:text-white flex-grow bg-transparent p-1 text-sm outline-none"}/>

                {editor.getAttributes("link").href ? (
                    <Button
                        size={"small"}
                        variant="text"
                        type="button"
                        color={"text"}
                        className="flex items-center"
                        onClick={() => {
                            editor.chain().focus().unsetLink().run();
                        }}
                    >
                        <DeleteIcon size="small"/>
                    </Button>
                ) : (
                    <Button size={"small"}
                            variant={"text"}>
                        <CheckIcon size="small"/>
                    </Button>
                )}
            </form>
        </Popover>
    );
};
