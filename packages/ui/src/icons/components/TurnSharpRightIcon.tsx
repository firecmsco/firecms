import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TurnSharpRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"turn_sharp_right"} ref={ref}/>
});

TurnSharpRightIcon.displayName = "TurnSharpRightIcon";
