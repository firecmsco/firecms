import {
    BuildIcon,
    CheckCircleOutlineIcon,
    CircularProgress,
    cn,
    HelpOutlineIcon,
    LoadingButton,
    Tooltip
} from "@firecms/ui";
import { useEffect, useState } from "react";

export function DoctorCheck({
                                serviceIsEnabled,
                                enableService,
                                disabled,
                                tooltip,
                                title,
                                loading
                            }: {
    title: string,
    disabled: boolean,
    tooltip?: string,
    serviceIsEnabled?: boolean | "loading" | null,
    enableService: () => Promise<void>,
    loading?: boolean,
}) {

    const [enabling, setEnabling] = useState<boolean>(false);

    useEffect(() => {
        if (serviceIsEnabled === "loading")
            setEnabling(true);
        else
            setEnabling(false);
    }, [serviceIsEnabled]);

    const doEnable = () => {
        console.log("Enabling service");
        setEnabling(true);
        return enableService().finally(() => setEnabling(false))
    }

    return <Tooltip
        title={tooltip ?? (disabled ? "Enable required APIs first" : "")}>
        <div className={cn("h-10 flex items-center")}>

            <div
                className="flex-grow px-3 h-full font-semibold flex items-center">
                {title}
            </div>

            {!loading && <div
                className=" h-full flex items-center">

                {serviceIsEnabled &&
                    <CheckCircleOutlineIcon color={"success"}/>}

                {!serviceIsEnabled && serviceIsEnabled === null &&
                    <HelpOutlineIcon color="warning"/>}

                {!serviceIsEnabled && serviceIsEnabled !== null &&
                    <LoadingButton
                        variant="outlined"
                        color="secondary"
                        size={"small"}
                        onClick={doEnable}
                        disabled={disabled || enabling}
                        loading={enabling}
                        startIcon={<BuildIcon size={"small"}/>}
                    >
                        Enable
                    </LoadingButton>}

            </div>}

            {loading && <CircularProgress size={"small"}/>}

        </div>
    </Tooltip>;
}
