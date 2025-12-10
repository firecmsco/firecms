import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PedalBikeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pedal_bike"} ref={ref}/>
});

PedalBikeIcon.displayName = "PedalBikeIcon";
