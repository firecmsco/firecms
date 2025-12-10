import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TocIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"toc"} ref={ref}/>
});

TocIcon.displayName = "TocIcon";
