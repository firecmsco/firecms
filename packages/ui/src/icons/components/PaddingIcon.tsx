import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PaddingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"padding"} ref={ref}/>
});

PaddingIcon.displayName = "PaddingIcon";
