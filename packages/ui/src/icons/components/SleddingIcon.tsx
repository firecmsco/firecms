import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SleddingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sledding"} ref={ref}/>
});

SleddingIcon.displayName = "SleddingIcon";
