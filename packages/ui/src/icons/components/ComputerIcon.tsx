import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ComputerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"computer"} ref={ref}/>
});

ComputerIcon.displayName = "ComputerIcon";
