import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CameraswitchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cameraswitch"} ref={ref}/>
});

CameraswitchIcon.displayName = "CameraswitchIcon";
