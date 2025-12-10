import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HelpCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"help_center"} ref={ref}/>
});

HelpCenterIcon.displayName = "HelpCenterIcon";
