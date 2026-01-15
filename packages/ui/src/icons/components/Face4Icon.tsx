import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Face4Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_4"} ref={ref}/>
});

Face4Icon.displayName = "Face4Icon";
