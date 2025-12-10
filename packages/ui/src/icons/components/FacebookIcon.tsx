import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FacebookIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"facebook"} ref={ref}/>
});

FacebookIcon.displayName = "FacebookIcon";
