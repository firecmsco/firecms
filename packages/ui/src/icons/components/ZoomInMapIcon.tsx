import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ZoomInMapIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"zoom_in_map"} ref={ref}/>
});

ZoomInMapIcon.displayName = "ZoomInMapIcon";
