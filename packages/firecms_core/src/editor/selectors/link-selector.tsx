import { useEffect, useRef, useState} from "react";
import { Button, CheckIcon, cls, DeleteIcon, focusedDisabled, Popover, Typography } from "@firecms/ui";
import { useTranslation } from "../../hooks/useTranslation";
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

    const [error, setError] = useState<string | null>(null);
    const isInputInvalid = !!error;

    useEffect(() => {
        setError(null);
    }, [open]);

    if (!state || !view) return null;

    const handleChange = (e: React.ChangeEvent<HTMLFormElement>) => {
        if (isInputInvalid) setError(null);
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);

        const value = inputRef.current?.value;
        if (!value) return;
        const url = getUrlFromString(value);

        if (!url) {
            setError(t("editor_invalid_url"));
            return;
        }

        setMark(schema.marks.link, { href: url })(view.state, view.dispatch);
        view.focus();
        onOpenChange(false);
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
                    {t("editor_link")}
                </p>
            </Button>}>
            <form
                onSubmit={handleSubmit}
                className="flex p-1 gap-1"
                onChange={handleChange}
            >
                <input
                    ref={inputRef}
                    autoFocus={open}
                    placeholder={t("editor_paste_or_type_link")}
                    defaultValue={href}
                    className={cls("text-surface-900 dark:text-white flex-grow bg-transparent p-1 text-sm outline-none", focusedDisabled)}
                    aria-invalid={isInputInvalid} />

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
            {error && (
                <div className="p-2">
                    <Typography
                        variant="caption"
                        color="error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </Typography>
                </div>
            )}
        </Popover>
    );
};
