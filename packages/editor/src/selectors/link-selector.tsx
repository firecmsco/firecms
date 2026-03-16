import { useEffect, useRef, } from "react";
import { Button, CheckIcon, cls, DeleteIcon, focusedDisabled, Popover } from "@firecms/ui";
import { useTranslation, FireCMSTranslations } from "@firecms/core";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { getMarkAttributes, isMarkActive, setMark, unsetMark } from "../utils/prosemirror-utils";
import { schema } from "../schema";

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
    const { state, view } = useProseMirrorContext();
    const { t } = useTranslation();

    // Autofocus on input by default
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    if (!state || !view) return null;

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const value = inputRef.current?.value;
        if (!value) return;
        const url = getUrlFromString(value);
        if (url) {
            setMark(schema.marks.link, { href: url })(view.state, view.dispatch);
            view.focus();
            onOpenChange(false);
        }
    };

    const handleRemoveLink = () => {
        unsetMark(schema.marks.link)(view.state, view.dispatch);
        view.focus();
        onOpenChange(false);
    };

    const isActive = isMarkActive(state, schema.marks.link);
    const href = getMarkAttributes(state, schema.marks.link).href || "";

    return (
        <Popover modal={true}
            open={open}
            onOpenChange={onOpenChange}
            trigger={<Button variant="text"
                type="button"
                className="gap-2 rounded-none"
                color={"text"}>
                <p className={cls("underline decoration-stone-400 underline-offset-4", {
                    "text-blue-500": isActive,
                })}>
                    {t("editor_link" as keyof FireCMSTranslations)}
                </p>
            </Button>}>
            <form
                onSubmit={handleSubmit}
                className="flex p-1 gap-1"
            >
                <input
                    ref={inputRef}
                    autoFocus={open}
                    placeholder={t("editor_paste_or_type_link" as keyof FireCMSTranslations)}
                    defaultValue={href}
                    className={cls("text-surface-900 dark:text-white flex-grow bg-transparent p-1 text-sm outline-none", focusedDisabled)} />

                {href ? (
                    <Button
                        size={"small"}
                        variant="text"
                        type="button"
                        color={"text"}
                        className="flex items-center"
                        onClick={handleRemoveLink}
                    >
                        <DeleteIcon size="small" />
                    </Button>
                ) : (
                    <Button size={"small"}
                        type="submit"
                        variant={"text"}>
                        <CheckIcon size="small" />
                    </Button>
                )}
            </form>
        </Popover>
    );
};
