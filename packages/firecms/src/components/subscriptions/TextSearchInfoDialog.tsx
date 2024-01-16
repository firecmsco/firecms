import { CloseIcon, Dialog, DialogContent, IconButton, LoadingButton, SearchIcon, Typography } from "@firecms/ui";
import { useProjectConfig } from "../../hooks";
import { SubscriptionPlanWidget } from "./SubscriptionPlanWidget";
import { UpgradeToPlusButton } from "./UpgradeToPlusButton";
import { useSnackbarController } from "@firecms/core";
import { useState } from "react";

export function TextSearchInfoDialog({
                                         open,
                                         closeDialog,
                                     }: {
    open: boolean,
    closeDialog: () => void
}) {

    const snackbarController = useSnackbarController();
    const projectConfig = useProjectConfig();
    const [enablingLocalSearch, setEnablingLocalSearch] = useState<boolean>(false);

    return <Dialog
        maxWidth={"2xl"}
        open={open}
        onOpenChange={(open: boolean) => !open ? closeDialog() : undefined}
    >
        <DialogContent className={"flex flex-col gap-4"}>
            <Typography variant={"h5"} className={"flex flex-row gap-4 items-center"}>
                <SearchIcon/>
                Enable local text search
            </Typography>

            <SubscriptionPlanWidget
                includeCTA={false}
                showForPlans={["free"]}
                message={<>Upgrade to PLUS to use local search</>}/>

            <Typography>
                Local text search allows you to search your data without
                having to create a Cloud Function. This is a great way to
                get started with FireCMS.
            </Typography>

            <Typography>
                Note that enabling local text search will need to fetch all documents
                from your collection and store them in the browser. This can be inefficient
                for large collections. It can also incur in additional costs.
            </Typography>

            <Typography>
                If you are using a paid plan, you are encouraged to use an external
                search engine such as Algolia or Elastic Search.
            </Typography>

            <div className={"flex items-end justify-end gap-4"}>
                <LoadingButton variant={"outlined"}
                               loading={enablingLocalSearch}
                               size={"large"}
                               onClick={() => {
                                   setEnablingLocalSearch(true);
                                   projectConfig.updateLocalTextSearchEnabled(true)
                                       .then(() => {
                                           snackbarController.open({
                                               message: "Local text search enabled",
                                               type: "success"
                                           });
                                           closeDialog();
                                       })
                                       .finally(() => setEnablingLocalSearch(false));
                               }}
                               disabled={!projectConfig.canUseLocalTextSearch}>Enable local text search</LoadingButton>
                {!projectConfig.canUseLocalTextSearch && <UpgradeToPlusButton/>}
            </div>

        </DialogContent>

        <IconButton className={"absolute top-4 right-4"}
                    onClick={closeDialog}>
            <CloseIcon/>
        </IconButton>
    </Dialog>;
}
