import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AgricultureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"agriculture"} ref={ref}/>
});

AgricultureIcon.displayName = "AgricultureIcon";
