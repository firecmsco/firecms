import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaVerticalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_vertical"} ref={ref}/>
});

PanoramaVerticalIcon.displayName = "PanoramaVerticalIcon";
