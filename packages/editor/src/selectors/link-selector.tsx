import { useEditor } from "../components";
import { useEffect, useRef, } from "react";
import { Button, CheckIcon, cls, DeleteIcon, focusedDisabled, Popover } from "@firecms/ui";

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
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    if (!editor) return null;

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const value = inputRef.current?.value;
        if (!value) return;
        const url = getUrlFromString(value);
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
            onOpenChange(false);
        }
    };

    const handleRemoveLink = () => {
        editor.chain().focus().unsetLink().run();
        onOpenChange(false);
    };

    return (
        <Popover modal={true}
                 open={open}
                 onOpenChange={onOpenChange}
                 trigger={<Button variant="text"
                                  type="button"
                                  className="gap-2 rounded-none"
                                  color={"text"}>
                     <p className={cls("underline decoration-stone-400 underline-offset-4", {
                         "text-blue-500": editor.isActive("link"),
                     })}>
                         Link
                     </p>
                 </Button>}>
            <form
                onSubmit={handleSubmit}
                className="flex p-1 gap-1"
            >
                <input
                    ref={inputRef}
                    autoFocus={open}
                    placeholder="Paste a link"
                    defaultValue={editor.getAttributes("link").href || ""}
                    className={cls("text-surface-900 dark:text-white flex-grow bg-transparent p-1 text-sm outline-none", focusedDisabled)}/>

                {editor.getAttributes("link").href ? (
                    <Button
                        size={"small"}
                        variant="text"
                        type="button"
                        color={"text"}
                        className="flex items-center"
                        onClick={handleRemoveLink}
                    >
                        <DeleteIcon size="small"/>
                    </Button>
                ) : (
                    <Button size={"small"}
                            type="submit"
                            variant={"text"}>
                        <CheckIcon size="small"/>
                    </Button>
                )}
            </form>
        </Popover>
    );
};
