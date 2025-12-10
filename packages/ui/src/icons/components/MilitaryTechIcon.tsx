import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MilitaryTechIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"military_tech"} ref={ref}/>
});

MilitaryTechIcon.displayName = "MilitaryTechIcon";
