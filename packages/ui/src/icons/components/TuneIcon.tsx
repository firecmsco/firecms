import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TuneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tune"} ref={ref}/>
});

TuneIcon.displayName = "TuneIcon";
