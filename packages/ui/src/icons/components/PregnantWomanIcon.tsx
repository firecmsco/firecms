import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PregnantWomanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pregnant_woman"} ref={ref}/>
});

PregnantWomanIcon.displayName = "PregnantWomanIcon";
