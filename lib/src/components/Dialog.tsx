import { MouseEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { paperMixin } from "../styles";
import Typography from "./Typography";
import { Button } from "./Button";

export const DialogTest = () => {
    const [isOpened, setIsOpened] = useState(false);

    const onProceed = () => {
        console.log("Proceed clicked");
    };

    return (
        <div>
            <button onClick={() => setIsOpened(true)}>Open dialog modal</button>

            <Dialog
                title="Dialog modal example"
                open={isOpened}
                onProceed={onProceed}
                onClose={() => setIsOpened(false)}
            >
                <p>To close: click Close, press Escape, or click outside.</p>
            </Dialog>
        </div>
    );
};

const isClickInsideRectangle = (e: MouseEvent, element: HTMLElement) => {
    const r = element.getBoundingClientRect();

    return (
        e.clientX > r.left &&
        e.clientX < r.right &&
        e.clientY > r.top &&
        e.clientY < r.bottom
    );
};

type DialogProps = {
    title: string;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const Dialog = ({
                           title,
                           open,
                           onClose,
                           children,
                       }: DialogProps) => {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [open]);

    return (
        <dialog
            ref={ref}
            onCancel={onClose}
            onClick={(e) =>
                ref.current && !isClickInsideRectangle(e, ref.current) && onClose()
            }
            className={clsx(paperMixin, "w-[400px] shadow-lg")}
            style={{
                // "--tw-backdrop-bg-opacity": "0.3",
                // "backdrop-filter": "brightness(100)",
                // "background-color": "rgba(0, 0, 0, var(--tw-backdrop-bg-opacity))"
            }}>

            <Typography variant={"h6"}>{title}</Typography>

            {children}

            <Button onClick={onClose}>Close</Button>
        </dialog>
    );
};
