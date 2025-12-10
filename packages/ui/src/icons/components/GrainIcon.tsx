import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GrainIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grain"} ref={ref}/>
});

GrainIcon.displayName = "GrainIcon";
