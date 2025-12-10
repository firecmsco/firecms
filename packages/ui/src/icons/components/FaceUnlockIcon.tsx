import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FaceUnlockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_unlock"} ref={ref}/>
});

FaceUnlockIcon.displayName = "FaceUnlockIcon";
