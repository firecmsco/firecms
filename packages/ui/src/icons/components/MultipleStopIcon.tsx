import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MultipleStopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"multiple_stop"} ref={ref}/>
});

MultipleStopIcon.displayName = "MultipleStopIcon";
