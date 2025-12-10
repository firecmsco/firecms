import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ConnectedTvIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"connected_tv"} ref={ref}/>
});

ConnectedTvIcon.displayName = "ConnectedTvIcon";
