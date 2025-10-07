import { InfoOutlineIcon, Tooltip } from "@firecms/ui";

export function Tip({
                        tip,
                        children
                    }: { tip: string, children?: React.ReactNode }) {
    return <Tooltip title={tip}>
        {children} <InfoOutlineIcon className={"inline align-middle"} size={"smallest"}/>
    </Tooltip>
}
