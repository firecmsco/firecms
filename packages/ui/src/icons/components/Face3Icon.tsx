import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Face3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_3"} ref={ref}/>
});

Face3Icon.displayName = "Face3Icon";
