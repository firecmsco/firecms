import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImportContactsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"import_contacts"} ref={ref}/>
});

ImportContactsIcon.displayName = "ImportContactsIcon";
