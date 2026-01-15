import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CribIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crib"} ref={ref}/>
});

CribIcon.displayName = "CribIcon";
