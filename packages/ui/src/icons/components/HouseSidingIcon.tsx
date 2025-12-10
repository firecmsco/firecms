import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HouseSidingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"house_siding"} ref={ref}/>
});

HouseSidingIcon.displayName = "HouseSidingIcon";
