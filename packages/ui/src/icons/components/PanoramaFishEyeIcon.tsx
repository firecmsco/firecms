import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaFisheyeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_fisheye"} ref={ref}/>
});

PanoramaFisheyeIcon.displayName = "PanoramaFisheyeIcon";
