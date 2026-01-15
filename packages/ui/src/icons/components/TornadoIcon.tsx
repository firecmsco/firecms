import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TornadoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tornado"} ref={ref}/>
});

TornadoIcon.displayName = "TornadoIcon";
