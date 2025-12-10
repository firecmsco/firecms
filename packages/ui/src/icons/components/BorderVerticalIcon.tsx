import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BorderVerticalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"border_vertical"} ref={ref}/>
});

BorderVerticalIcon.displayName = "BorderVerticalIcon";
