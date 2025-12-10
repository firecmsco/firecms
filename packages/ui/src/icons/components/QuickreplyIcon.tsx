import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuickreplyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"quickreply"} ref={ref}/>
});

QuickreplyIcon.displayName = "QuickreplyIcon";
