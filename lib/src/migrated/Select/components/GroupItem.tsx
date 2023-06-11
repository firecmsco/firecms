import React from "react";

import Item from "./Item";
import { useSelectContext } from "./SelectProvider";
import { GroupOption } from "./type";

interface GroupItemProps {
    item: GroupOption;
    primaryColor: string;
}

const GroupItem: React.FC<GroupItemProps> = ({ item, primaryColor }) => {
    const { classNames, formatGroupLabel } = useSelectContext();

    return (
        <>
            {item.options.length > 0 && (
                <>
                    {formatGroupLabel ? (
                        <>{formatGroupLabel(item)}</>
                    ) : (
                        <div
                            className={
                                classNames?.listGroupLabel
                                    ? classNames.listGroupLabel
                                    : "pr-2 py-2 cursor-default select-none truncate font-bold text-gray-700"
                            }
                        >
                            {item.label}
                        </div>
                    )}

                    {item.options.map((item, index) => (
                        <Item primaryColor={primaryColor} key={index} item={item} />
                    ))}
                </>
            )}
        </>
    );
};

export default GroupItem;
