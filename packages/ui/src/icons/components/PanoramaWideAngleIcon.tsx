import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaWideAngleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_wide_angle"} ref={ref}/>
});

PanoramaWideAngleIcon.displayName = "PanoramaWideAngleIcon";
