import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RawOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"raw_off"} ref={ref}/>
});

RawOffIcon.displayName = "RawOffIcon";
