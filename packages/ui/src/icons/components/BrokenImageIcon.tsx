import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrokenImageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"broken_image"} ref={ref}/>
});

BrokenImageIcon.displayName = "BrokenImageIcon";
