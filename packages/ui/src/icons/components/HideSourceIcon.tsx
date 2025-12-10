import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HideSourceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hide_source"} ref={ref}/>
});

HideSourceIcon.displayName = "HideSourceIcon";
