import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TitleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"title"} ref={ref}/>
});

TitleIcon.displayName = "TitleIcon";
