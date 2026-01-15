import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonalInjuryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"personal_injury"} ref={ref}/>
});

PersonalInjuryIcon.displayName = "PersonalInjuryIcon";
