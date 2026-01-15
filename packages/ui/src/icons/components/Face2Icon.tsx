import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Face2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"face_2"} ref={ref}/>
});

Face2Icon.displayName = "Face2Icon";
