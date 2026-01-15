import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BorderBottomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"border_bottom"} ref={ref}/>
});

BorderBottomIcon.displayName = "BorderBottomIcon";
