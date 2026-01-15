import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NightlightRoundIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nightlight_round"} ref={ref}/>
});

NightlightRoundIcon.displayName = "NightlightRoundIcon";
