import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FreeCancellationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"free_cancellation"} ref={ref}/>
});

FreeCancellationIcon.displayName = "FreeCancellationIcon";
