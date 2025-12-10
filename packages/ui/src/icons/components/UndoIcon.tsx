import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UndoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"undo"} ref={ref}/>
});

UndoIcon.displayName = "UndoIcon";
