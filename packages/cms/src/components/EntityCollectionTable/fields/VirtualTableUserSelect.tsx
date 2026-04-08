import type { EntityCollection } from "@rebasepro/types";
import React, { useCallback, useEffect } from "react";
import { MultiSelect, MultiSelectItem, Select, SelectItem } from "@rebasepro/ui";
import { User, UserManagementDelegate } from "@rebasepro/types";
import { useInternalUserManagementController } from "@rebasepro/core";
import { UserDisplay } from "@rebasepro/core";

export function VirtualTableUserSelect(props: {
    name: string;
    error: Error | undefined;
    multiple: boolean;
    disabled: boolean;
    small: boolean;
    internalValue: string | string[] | undefined;
    updateValue: (newValue: (string | string[] | null)) => void;
    focused: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const {
        internalValue,
        disabled,
        small,
        focused,
        updateValue,
        multiple
    } = props;

    const userManagementContext = useInternalUserManagementController<User>();
    const users = userManagementContext?.users ?? [];
    const getUser = userManagementContext?.getUser;

    const validValue = (Array.isArray(internalValue) && multiple) ||
        (!Array.isArray(internalValue) && !multiple);

    const ref = React.useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (ref.current && focused) {
            ref.current?.focus({ preventScroll: true });
        }
    }, [focused, ref]);

    const onChange = useCallback((updatedValue: string | string[]) => {
        if (!updatedValue) {
            updateValue(null);
        } else {
            updateValue(updatedValue);
        }
    }, [updateValue]);

    const renderValue = (userId: string) => {
        const user = getUser?.(userId) || null;
        return <UserDisplay user={user} />;
    };

    return (
        multiple
            ? <MultiSelect
                inputRef={ref}
                className="w-full h-full p-0 bg-transparent"
                position={"item-aligned"}
                disabled={disabled}
                includeClear={false}
                useChips={true} // Changed to true to allow custom rendering of chips
                value={validValue
                    ? (internalValue as string[])
                    : ([])}
                onValueChange={onChange}
                renderValues={(ids) => {
                    return <div className={"flex flex-row overflow-hidden flex-wrap max-w-full gap-2 items-center"}>
                        {ids.map((id) => {
                            const user = users.find((user: User) => user.uid === id) || getUser?.(id) || null;
                            if (!user) return <div key={id}>{id}</div>;
                            return <UserDisplay key={id} user={user} />;
                        })}
                    </div>;
                }}
            >
                {users?.map((user: User) => (
                    <MultiSelectItem
                        key={user.uid}
                        value={user.uid}>
                        <UserDisplay
                            user={user} />
                    </MultiSelectItem>
                ))}
            </MultiSelect>
            : <Select
                inputRef={ref}
                fullWidth={true}
                className="w-full h-full p-0 bg-transparent"
                position={"item-aligned"}
                disabled={disabled}
                padding={false}
                value={validValue
                    ? internalValue as string
                    : ""}
                onValueChange={onChange}
                renderValue={renderValue}>
                {users?.map((user: User) => (
                    <SelectItem
                        key={user.uid}
                        value={user.uid}>
                        <UserDisplay
                            user={user} />
                    </SelectItem>
                ))}
            </Select>

    );
}

