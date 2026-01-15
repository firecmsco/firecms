import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TurnRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"turn_right"} ref={ref}/>
});

TurnRightIcon.displayName = "TurnRightIcon";
