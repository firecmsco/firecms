import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ZoomOutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"zoom_out"} ref={ref}/>
});

ZoomOutIcon.displayName = "ZoomOutIcon";
