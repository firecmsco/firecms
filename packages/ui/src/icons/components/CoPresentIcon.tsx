import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CoPresentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"co_present"} ref={ref}/>
});

CoPresentIcon.displayName = "CoPresentIcon";
