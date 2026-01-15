import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CompostIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"compost"} ref={ref}/>
});

CompostIcon.displayName = "CompostIcon";
