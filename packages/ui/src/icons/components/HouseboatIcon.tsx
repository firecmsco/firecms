import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HouseboatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"houseboat"} ref={ref}/>
});

HouseboatIcon.displayName = "HouseboatIcon";
