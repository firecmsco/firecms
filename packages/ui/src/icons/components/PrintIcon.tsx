import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PrintIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"print"} ref={ref}/>
});

PrintIcon.displayName = "PrintIcon";
