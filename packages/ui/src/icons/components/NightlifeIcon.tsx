import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NightlifeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nightlife"} ref={ref}/>
});

NightlifeIcon.displayName = "NightlifeIcon";
