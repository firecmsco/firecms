import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NightShelterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"night_shelter"} ref={ref}/>
});

NightShelterIcon.displayName = "NightShelterIcon";
