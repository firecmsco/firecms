import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HelpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"help"} ref={ref}/>
});

HelpIcon.displayName = "HelpIcon";
