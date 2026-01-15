import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PeopleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"people_outline"} ref={ref}/>
});

PeopleOutlineIcon.displayName = "PeopleOutlineIcon";
