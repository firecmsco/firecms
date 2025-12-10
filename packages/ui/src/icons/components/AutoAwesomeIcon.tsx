import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoAwesomeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_awesome"} ref={ref}/>
});

AutoAwesomeIcon.displayName = "AutoAwesomeIcon";
