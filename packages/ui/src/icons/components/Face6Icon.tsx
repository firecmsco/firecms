import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Face6Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_6"} ref={ref}/>
});

Face6Icon.displayName = "Face6Icon";
