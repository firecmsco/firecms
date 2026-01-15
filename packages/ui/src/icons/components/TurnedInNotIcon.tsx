import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TurnedInNotIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"turned_in_not"} ref={ref}/>
});

TurnedInNotIcon.displayName = "TurnedInNotIcon";
