import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutofpsSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"autofps_select"} ref={ref}/>
});

AutofpsSelectIcon.displayName = "AutofpsSelectIcon";
