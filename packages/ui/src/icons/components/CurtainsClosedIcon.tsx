import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurtainsClosedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"curtains_closed"} ref={ref}/>
});

CurtainsClosedIcon.displayName = "CurtainsClosedIcon";
