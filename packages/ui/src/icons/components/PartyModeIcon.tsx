import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PartyModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"party_mode"} ref={ref}/>
});

PartyModeIcon.displayName = "PartyModeIcon";
