import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AnimationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"animation"} ref={ref}/>
});

AnimationIcon.displayName = "AnimationIcon";
