import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StarBorderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"star_border"} ref={ref}/>
});

StarBorderIcon.displayName = "StarBorderIcon";
