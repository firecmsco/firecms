import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AspectRatioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"aspect_ratio"} ref={ref}/>
});

AspectRatioIcon.displayName = "AspectRatioIcon";
