import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OutputIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"output"} ref={ref}/>
});

OutputIcon.displayName = "OutputIcon";
