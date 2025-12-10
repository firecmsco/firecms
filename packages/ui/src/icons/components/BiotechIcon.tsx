import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BiotechIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"biotech"} ref={ref}/>
});

BiotechIcon.displayName = "BiotechIcon";
