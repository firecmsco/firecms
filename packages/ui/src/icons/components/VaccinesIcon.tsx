import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VaccinesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vaccines"} ref={ref}/>
});

VaccinesIcon.displayName = "VaccinesIcon";
