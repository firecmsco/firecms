import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TypeSpecimenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"type_specimen"} ref={ref}/>
});

TypeSpecimenIcon.displayName = "TypeSpecimenIcon";
