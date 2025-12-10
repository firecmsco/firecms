import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GirlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"girl"} ref={ref}/>
});

GirlIcon.displayName = "GirlIcon";
