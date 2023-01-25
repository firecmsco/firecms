// FORKED FROM https://github.com/fayeed/use-clipboard

import {
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

export interface UseClipboardProps {
    /**
     * It's callback function that is called after the `copy` command
     * is executed.
     *
     * @param text: The selected clipboard text.
     */
    onSuccess?: (text: string) => void;

    /**
     * Triggers when the hook encounters an error.
     * If passed hook won't throw an error.
     *
     * @param error: cause of the error
     */
    onError?: (error: string) => void;

    /**
     * Disables the new clipboard API `navigator.clipboard` even if
     * it is supported.
     */
    disableClipboardAPI?: boolean;

    /**
     * revert back the isCopied flag to false again if a value is set.
     */
    copiedDuration?: number;
}

export interface useClipboardReturnType {
    /**
     * Use ref to pull the text content from.
     */
    ref: MutableRefObject<any>;

    /**
     * Use it to perform the copy operation
     */
    copy: (text?: string) => void;

    /**
     * Use it to perform the cut operation
     */
    cut: () => void;

    /**
     * Indicates wheater the content was successfully copied or not.
     */
    isCoppied: boolean;

    /**
     * Current selected clipboard content.
     */
    clipboard: string;

    /**
     * Clears the user clipboard.
     */
    clearClipboard: () => void;

    /**
     * Check to see if the browser supports the new `navigator.clipboard` API.
     */
    isSupported: () => boolean;
}

export const useClipboard = (
    options?: UseClipboardProps
): useClipboardReturnType => {
    const { onSuccess, onError, disableClipboardAPI = false, copiedDuration } =
    options || {};
    const ref = useRef<any>(null);
    const [isCoppied, setIsCoppied] = useState(false);
    const [clipboard, setClipbaord] = useState("");

    useEffect(() => {
        if (copiedDuration) setTimeout(() => setIsCoppied(false), copiedDuration);
    }, [isCoppied]);

    const isSupported = () => navigator.clipboard !== undefined;

    const handleError = useCallback((error: string) => {
        if (onError) onError(error);
        else throw new Error(error);
    }, [onError]);

    const handleSuccess = useCallback((text: string) => {
        if (onSuccess) onSuccess(text);
        setIsCoppied(true);
        setClipbaord(text);
    }, [onSuccess]);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => handleSuccess(text))
            .catch((err) => {
                handleError(err);
                setIsCoppied(false);
            });
    }, [handleError, handleSuccess]);

    const clearClipboard = () => {
        if (isSupported()) {
            navigator.clipboard.writeText("");
        }
    };

    const copy = (text?: string) =>
        action("copy", typeof text === "object" ? undefined : text);

    const cut = () => action("cut");

    const action = useCallback(
        (operation = "copy", text?: string) => {
            const element = ref.current as HTMLElement;

            const isInput =
                element &&
                (element.tagName === "INPUT" || element.tagName === "TEXTAREA");

            const input = ref.current as HTMLInputElement;

            if (isSupported() && !disableClipboardAPI) {
                if (text) {
                    copyToClipboard(text);
                } else if (element) {
                    if (isInput) {
                        copyToClipboard(input.value);

                        if (operation === "cut") {
                            input.value = "";
                        }
                    } else {
                        copyToClipboard(element.innerText);
                    }
                } else {
                    handleError("Both the ref & text were undefined");
                }
            }
        },
        [disableClipboardAPI, copyToClipboard, handleError]
    );

    return {
        ref,
        isCoppied,
        clipboard,
        clearClipboard,
        isSupported,
        copy,
        cut
    };
};
