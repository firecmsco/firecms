import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FastRewindIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fast_rewind"} ref={ref}/>
});

FastRewindIcon.displayName = "FastRewindIcon";
