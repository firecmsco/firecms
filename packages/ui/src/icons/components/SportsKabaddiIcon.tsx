import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsKabaddiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_kabaddi"} ref={ref}/>
});

SportsKabaddiIcon.displayName = "SportsKabaddiIcon";
