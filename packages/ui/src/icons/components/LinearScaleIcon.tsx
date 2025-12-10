import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LinearScaleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"linear_scale"} ref={ref}/>
});

LinearScaleIcon.displayName = "LinearScaleIcon";
