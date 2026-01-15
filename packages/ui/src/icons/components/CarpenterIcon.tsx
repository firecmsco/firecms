import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CarpenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"carpenter"} ref={ref}/>
});

CarpenterIcon.displayName = "CarpenterIcon";
