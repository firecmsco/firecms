import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_outline"} ref={ref}/>
});

PersonOutlineIcon.displayName = "PersonOutlineIcon";
