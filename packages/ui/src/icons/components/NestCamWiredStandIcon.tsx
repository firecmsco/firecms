import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NestCamWiredStandIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nest_cam_wired_stand"} ref={ref}/>
});

NestCamWiredStandIcon.displayName = "NestCamWiredStandIcon";
