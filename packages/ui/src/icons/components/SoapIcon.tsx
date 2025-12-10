import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SoapIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"soap"} ref={ref}/>
});

SoapIcon.displayName = "SoapIcon";
