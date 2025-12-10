import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TerminalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"terminal"} ref={ref}/>
});

TerminalIcon.displayName = "TerminalIcon";
