import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PropaneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"propane"} ref={ref}/>
});

PropaneIcon.displayName = "PropaneIcon";
