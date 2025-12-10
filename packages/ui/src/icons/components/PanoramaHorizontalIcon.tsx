import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaHorizontalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_horizontal"} ref={ref}/>
});

PanoramaHorizontalIcon.displayName = "PanoramaHorizontalIcon";
