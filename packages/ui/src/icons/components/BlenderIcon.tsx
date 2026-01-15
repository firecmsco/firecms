import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BlenderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"blender"} ref={ref}/>
});

BlenderIcon.displayName = "BlenderIcon";
