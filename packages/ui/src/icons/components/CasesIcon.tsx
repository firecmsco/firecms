import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CasesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cases"} ref={ref}/>
});

CasesIcon.displayName = "CasesIcon";
