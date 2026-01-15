import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsMmaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_mma"} ref={ref}/>
});

SportsMmaIcon.displayName = "SportsMmaIcon";
