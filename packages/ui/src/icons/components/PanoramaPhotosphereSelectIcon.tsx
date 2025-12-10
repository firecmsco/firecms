import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaPhotosphereSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_photosphere_select"} ref={ref}/>
});

PanoramaPhotosphereSelectIcon.displayName = "PanoramaPhotosphereSelectIcon";
