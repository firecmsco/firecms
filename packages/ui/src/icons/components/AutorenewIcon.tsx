import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutorenewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"autorenew"} ref={ref}/>
});

AutorenewIcon.displayName = "AutorenewIcon";
