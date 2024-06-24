import { cls, defaultBorderMixin, focusedMixin, Icon, IconButton, Label, MapFieldBinding } from "@firecms/cloud";
import { useState } from "react";

export const OptionalMap: typeof MapFieldBinding = (props) => {
    console.log("OptionalMap", props);
    const [open, setOpen] = useState(!!props.value);
    const [expanded, setExpanded] = useState(!!props.value);
    return (
        <div
            className={
                "px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2 bg-slate-50 bg-opacity-50 dark:bg-gray-900" +
                cls(defaultBorderMixin + " border", "rounded-md", "w-full")
            }
            style={{
                alignContent: "center"
            }}
        >
            <div
                className={cls(
                    focusedMixin,
                    "rounded flex items-center justify-between w-full min-h-[52px]",
                    "hover:bg-slate-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-10",
                    "p-4"
                )}
                onClick={() => {
                    if (open) {
                        setExpanded(!expanded);
                    } else {
                        setOpen(true);
                        setExpanded(true);
                    }
                }}
            >
                <Label style={{
                    flex: 1,
                    flexFlow: "column"
                }}>
                    {open ? `${props.property.name || "property"}` : `Add ${props.property.name || "property"}`}
                </Label>
                {open
                    ? (
                        <>
                            <IconButton
                                onClick={() => {
                                    setOpen(false);
                                    setExpanded(false);
                                    props.setValue(null);
                                }}
                            >
                                <Icon iconKey="delete"/>
                            </IconButton>
                            <Icon iconKey={expanded ? "expand_less" : "expand_more"}/>
                        </>
                    )
                    : (
                        <Icon iconKey="add_circle_outline"/>
                    )}
            </div>
            {open && expanded ? <MapFieldBinding {...props} /> : null}
        </div>
    );
};
