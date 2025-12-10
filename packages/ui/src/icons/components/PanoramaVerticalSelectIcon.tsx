import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanoramaVerticalSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"panorama_vertical_select"} ref={ref}/>
});

PanoramaVerticalSelectIcon.displayName = "PanoramaVerticalSelectIcon";
