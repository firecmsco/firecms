import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Face5Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_5"} ref={ref}/>
});

Face5Icon.displayName = "Face5Icon";
