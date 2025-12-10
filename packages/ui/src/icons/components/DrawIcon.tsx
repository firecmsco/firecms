import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DrawIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"draw"} ref={ref}/>
});

DrawIcon.displayName = "DrawIcon";
