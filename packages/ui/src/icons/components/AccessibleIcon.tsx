import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessibleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"accessible"} ref={ref}/>
});

AccessibleIcon.displayName = "AccessibleIcon";
