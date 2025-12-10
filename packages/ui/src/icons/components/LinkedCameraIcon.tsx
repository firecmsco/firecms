import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LinkedCameraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"linked_camera"} ref={ref}/>
});

LinkedCameraIcon.displayName = "LinkedCameraIcon";
