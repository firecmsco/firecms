import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FenceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fence"} ref={ref}/>
});

FenceIcon.displayName = "FenceIcon";
