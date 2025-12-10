import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TabletMacIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tablet_mac"} ref={ref}/>
});

TabletMacIcon.displayName = "TabletMacIcon";
