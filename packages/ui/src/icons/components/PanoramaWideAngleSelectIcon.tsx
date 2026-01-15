import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaWideAngleSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_wide_angle_select"} ref={ref}/>
});

PanoramaWideAngleSelectIcon.displayName = "PanoramaWideAngleSelectIcon";
