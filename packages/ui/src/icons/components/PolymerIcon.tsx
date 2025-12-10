import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PolymerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"polymer"} ref={ref}/>
});

PolymerIcon.displayName = "PolymerIcon";
