import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StarBorderPurple500Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"star_border_purple500"} ref={ref}/>
});

StarBorderPurple500Icon.displayName = "StarBorderPurple500Icon";
