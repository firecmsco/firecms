import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BathroomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bathroom"} ref={ref}/>
});

BathroomIcon.displayName = "BathroomIcon";
