import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CottageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cottage"} ref={ref}/>
});

CottageIcon.displayName = "CottageIcon";
