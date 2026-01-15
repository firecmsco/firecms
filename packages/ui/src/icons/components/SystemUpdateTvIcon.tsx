import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SystemUpdateTvIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"system_update_tv"} ref={ref}/>
});

SystemUpdateTvIcon.displayName = "SystemUpdateTvIcon";
