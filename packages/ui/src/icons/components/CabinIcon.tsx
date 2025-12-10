import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CabinIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cabin"} ref={ref}/>
});

CabinIcon.displayName = "CabinIcon";
