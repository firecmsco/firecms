import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CableIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cable"} ref={ref}/>
});

CableIcon.displayName = "CableIcon";
