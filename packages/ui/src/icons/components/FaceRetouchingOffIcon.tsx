import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FaceRetouchingOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_retouching_off"} ref={ref}/>
});

FaceRetouchingOffIcon.displayName = "FaceRetouchingOffIcon";
