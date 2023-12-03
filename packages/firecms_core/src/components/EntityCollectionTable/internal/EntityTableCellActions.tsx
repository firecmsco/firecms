import { IconButton } from "../../../ui";
import { ErrorTooltip } from "../../ErrorTooltip";
import { ErrorOutlineIcon } from "../../../icons";
import { useCallback, useEffect, useRef } from "react";

export interface EntityTableCellActionsProps {
    showError: false | Error | undefined;
    disabled: boolean;
    showExpandIcon: boolean | undefined;
    selected: boolean | undefined;
    openPopup?: (cellRect: DOMRect | undefined) => void;
    children?: React.ReactNode;
}

export function EntityTableCellActions({ showError, disabled, showExpandIcon, selected, openPopup, children }: EntityTableCellActionsProps) {

    const ref = useRef<HTMLDivElement>(null);
    const doOpenPopup = useCallback(() => {
        if (openPopup) {
            const cellRect = ref && ref?.current?.getBoundingClientRect();
            openPopup(cellRect);
        }
    }, []);

    const iconRef = useRef<HTMLButtonElement>();
    useEffect(() => {
        if (iconRef.current && selected) {
            iconRef.current.focus({ preventScroll: true });
        }
    }, [selected]);

    return <>
        {(showError || (!disabled && showExpandIcon)) &&
            <div ref={ref} className="absolute top-0.5 right-0.5 flex items-center">
                {selected && children}

                {selected && !disabled && showExpandIcon &&
                    <IconButton
                        ref={iconRef}
                        color={"inherit"}
                        size={"small"}
                        onClick={doOpenPopup}>
                        <svg
                            fill={"#888"}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24">
                            <path className="cls-2"
                                  d="M20,5a1,1,0,0,0-1-1L14,4h0a1,1,0,0,0,0,2h2.57L13.29,9.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L18,7.42V10a1,1,0,0,0,1,1h0a1,1,0,0,0,1-1Z"/>
                            <path className="cls-2"
                                  d="M10.71,13.29a1,1,0,0,0-1.42,0L6,16.57V14a1,1,0,0,0-1-1H5a1,1,0,0,0-1,1l0,5a1,1,0,0,0,1,1h5a1,1,0,0,0,0-2H7.42l3.29-3.29A1,1,0,0,0,10.71,13.29Z"/>
                        </svg>
                    </IconButton>
                }

                {showError && <ErrorTooltip
                    side={"left"}
                    className={"flex items-center justify-center"}
                    style={{ width: 32, height: 32 }}
                    title={showError.message}>
                    <ErrorOutlineIcon
                        size={"small"}
                        color={"error"}
                    />
                </ErrorTooltip>
                }

            </div>
        }
    </>;
}
