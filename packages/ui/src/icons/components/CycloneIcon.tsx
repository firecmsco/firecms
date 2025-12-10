import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CycloneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cyclone"} ref={ref}/>
});

CycloneIcon.displayName = "CycloneIcon";
