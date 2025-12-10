import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PeopleAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"people_alt"} ref={ref}/>
});

PeopleAltIcon.displayName = "PeopleAltIcon";
