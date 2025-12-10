import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PrintDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"print_disabled"} ref={ref}/>
});

PrintDisabledIcon.displayName = "PrintDisabledIcon";
