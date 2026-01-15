import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StarPurple500Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"star_purple500"} ref={ref}/>
});

StarPurple500Icon.displayName = "StarPurple500Icon";
