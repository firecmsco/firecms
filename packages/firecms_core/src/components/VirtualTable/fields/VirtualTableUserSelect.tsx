import React, { useCallback, useEffect } from "react";
import { MultiSelect, MultiSelectItem, Select, SelectItem } from "@firecms/ui";
import { useInternalUserManagementController } from "../../../hooks";
import { UserDisplay } from "../../UserDisplay";

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

    const { users, getUser } = useInternalUserManagementController();

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
        const user = getUser(userId);
        return <UserDisplay user={user}  />;
    };

    return (
        multiple
            ? <MultiSelect
                inputRef={ref}
                className="w-full h-full p-0 bg-transparent"
                position={"item-aligned"}
                disabled={disabled}
                includeClear={false}
                useChips={false}
                value={validValue
                    ? (internalValue as string[])
                    : ([])}
                onValueChange={onChange}>
                {users?.map((user) => (
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
                size={"large"}
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
                {users?.map((user) => (
                    <SelectItem
                        key={user.uid}
                        value={user.uid}>
                        <UserDisplay
                            user={user}/>
                    </SelectItem>
                ))}
            </Select>

    );
}

