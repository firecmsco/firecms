import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SosIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sos"} ref={ref}/>
});

SosIcon.displayName = "SosIcon";
