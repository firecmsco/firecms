import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DevicesOtherIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"devices_other"} ref={ref}/>
});

DevicesOtherIcon.displayName = "DevicesOtherIcon";
