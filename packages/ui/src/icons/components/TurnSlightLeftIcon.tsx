import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TurnSlightLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"turn_slight_left"} ref={ref}/>
});

TurnSlightLeftIcon.displayName = "TurnSlightLeftIcon";
