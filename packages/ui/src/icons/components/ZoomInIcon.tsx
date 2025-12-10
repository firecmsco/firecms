import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ZoomInIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"zoom_in"} ref={ref}/>
});

ZoomInIcon.displayName = "ZoomInIcon";
