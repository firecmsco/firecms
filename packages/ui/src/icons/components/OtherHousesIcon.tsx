import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OtherHousesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"other_houses"} ref={ref}/>
});

OtherHousesIcon.displayName = "OtherHousesIcon";
