import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TagIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tag"} ref={ref}/>
});

TagIcon.displayName = "TagIcon";
