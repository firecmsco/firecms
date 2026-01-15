import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TurnSlightRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"turn_slight_right"} ref={ref}/>
});

TurnSlightRightIcon.displayName = "TurnSlightRightIcon";
