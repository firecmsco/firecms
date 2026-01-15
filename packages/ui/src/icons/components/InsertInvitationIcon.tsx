import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertInvitationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_invitation"} ref={ref}/>
});

InsertInvitationIcon.displayName = "InsertInvitationIcon";
