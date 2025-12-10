import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BackspaceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"backspace"} ref={ref}/>
});

BackspaceIcon.displayName = "BackspaceIcon";
