import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NaturePeopleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nature_people"} ref={ref}/>
});

NaturePeopleIcon.displayName = "NaturePeopleIcon";
