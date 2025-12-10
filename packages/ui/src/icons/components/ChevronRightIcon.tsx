import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChevronRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"chevron_right"} ref={ref}/>
});

ChevronRightIcon.displayName = "ChevronRightIcon";
