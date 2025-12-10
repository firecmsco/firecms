import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FaceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face"} ref={ref}/>
});

FaceIcon.displayName = "FaceIcon";
