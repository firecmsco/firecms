import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaPhotosphereIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_photosphere"} ref={ref}/>
});

PanoramaPhotosphereIcon.displayName = "PanoramaPhotosphereIcon";
