import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DvrIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dvr"} ref={ref}/>
});

DvrIcon.displayName = "DvrIcon";
