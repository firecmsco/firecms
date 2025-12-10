import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaHorizontalSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_horizontal_select"} ref={ref}/>
});

PanoramaHorizontalSelectIcon.displayName = "PanoramaHorizontalSelectIcon";
