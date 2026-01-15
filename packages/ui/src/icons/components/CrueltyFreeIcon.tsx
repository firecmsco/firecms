import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CrueltyFreeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cruelty_free"} ref={ref}/>
});

CrueltyFreeIcon.displayName = "CrueltyFreeIcon";
