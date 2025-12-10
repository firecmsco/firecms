import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FitnessCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fitness_center"} ref={ref}/>
});

FitnessCenterIcon.displayName = "FitnessCenterIcon";
