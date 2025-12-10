import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoofingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"roofing"} ref={ref}/>
});

RoofingIcon.displayName = "RoofingIcon";
