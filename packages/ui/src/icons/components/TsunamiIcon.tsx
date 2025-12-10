import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TsunamiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tsunami"} ref={ref}/>
});

TsunamiIcon.displayName = "TsunamiIcon";
