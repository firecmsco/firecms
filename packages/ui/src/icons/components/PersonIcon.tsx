import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person"} ref={ref}/>
});

PersonIcon.displayName = "PersonIcon";
