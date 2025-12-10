import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WcIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wc"} ref={ref}/>
});

WcIcon.displayName = "WcIcon";
