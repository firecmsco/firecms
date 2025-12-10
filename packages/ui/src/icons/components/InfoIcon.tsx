import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InfoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"info"} ref={ref}/>
});

InfoIcon.displayName = "InfoIcon";
