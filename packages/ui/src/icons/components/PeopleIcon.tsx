import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PeopleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"people"} ref={ref}/>
});

PeopleIcon.displayName = "PeopleIcon";
