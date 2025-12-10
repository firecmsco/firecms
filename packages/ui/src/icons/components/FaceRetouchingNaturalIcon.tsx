import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FaceRetouchingNaturalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_retouching_natural"} ref={ref}/>
});

FaceRetouchingNaturalIcon.displayName = "FaceRetouchingNaturalIcon";
