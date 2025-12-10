import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VrpanoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vrpano"} ref={ref}/>
});

VrpanoIcon.displayName = "VrpanoIcon";
