import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TungstenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tungsten"} ref={ref}/>
});

TungstenIcon.displayName = "TungstenIcon";
