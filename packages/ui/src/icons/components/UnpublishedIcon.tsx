import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnpublishedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unpublished"} ref={ref}/>
});

UnpublishedIcon.displayName = "UnpublishedIcon";
