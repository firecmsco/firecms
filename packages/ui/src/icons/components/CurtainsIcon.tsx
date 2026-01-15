import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurtainsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"curtains"} ref={ref}/>
});

CurtainsIcon.displayName = "CurtainsIcon";
