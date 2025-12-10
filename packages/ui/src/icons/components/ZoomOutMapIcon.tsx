import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ZoomOutMapIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"zoom_out_map"} ref={ref}/>
});

ZoomOutMapIcon.displayName = "ZoomOutMapIcon";
