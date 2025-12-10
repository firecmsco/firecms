import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HideImageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hide_image"} ref={ref}/>
});

HideImageIcon.displayName = "HideImageIcon";
