import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RedoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"redo"} ref={ref}/>
});

RedoIcon.displayName = "RedoIcon";
