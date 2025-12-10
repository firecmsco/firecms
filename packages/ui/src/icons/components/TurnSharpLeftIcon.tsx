import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TurnSharpLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"turn_sharp_left"} ref={ref}/>
});

TurnSharpLeftIcon.displayName = "TurnSharpLeftIcon";
