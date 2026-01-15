import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BeachAccessIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"beach_access"} ref={ref}/>
});

BeachAccessIcon.displayName = "BeachAccessIcon";
