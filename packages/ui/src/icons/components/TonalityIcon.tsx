import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TonalityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tonality"} ref={ref}/>
});

TonalityIcon.displayName = "TonalityIcon";
