import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExpandMoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"expand_more"} ref={ref}/>
});

ExpandMoreIcon.displayName = "ExpandMoreIcon";
