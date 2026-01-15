import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TipsAndUpdatesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tips_and_updates"} ref={ref}/>
});

TipsAndUpdatesIcon.displayName = "TipsAndUpdatesIcon";
