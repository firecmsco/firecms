import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HelpOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"help_outline"} ref={ref}/>
});

HelpOutlineIcon.displayName = "HelpOutlineIcon";
