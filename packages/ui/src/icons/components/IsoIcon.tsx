import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IsoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"iso"} ref={ref}/>
});

IsoIcon.displayName = "IsoIcon";
