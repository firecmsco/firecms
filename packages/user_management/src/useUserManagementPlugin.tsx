import { FireCMSPlugin, useAuthController, User, useSnackbarController, useTranslation } from "@firecms/core";
import { UserManagementProvider } from "./UserManagementProvider";
import { UserManagement } from "./types";
import { AddIcon, Button, Paper, Typography } from "@firecms/ui";
import { DEFAULT_ROLES } from "./components/roles/default_roles";

export function useUserManagementPlugin<USER extends User = any>({ userManagement }: {
    userManagement: UserManagement<USER>,
}): FireCMSPlugin {

    const noUsers = userManagement.users.length === 0;
    const noRoles = userManagement.roles.length === 0;

    return {
        key: "user_management",
        loading: userManagement.loading,
        userManagement:{
            ...userManagement,
        },
        homePage: {
            additionalChildrenStart: noUsers || noRoles
                ? <IntroWidget
                    noUsers={noUsers}
                    noRoles={noRoles}
                    userManagement={userManagement}/>
                : undefined
        },
        provider: {
            Component: UserManagementProvider,
            props: {
                userManagement
            }
        }
    }
}

export function IntroWidget({
                                noUsers,
                                noRoles,
                                userManagement
                            }: {
    noUsers: boolean;
    noRoles: boolean;
    userManagement: UserManagement<any>;
}) {

    const authController = useAuthController();
    const snackbarController = useSnackbarController();
    const { t } = useTranslation();

    const buttonLabel = noUsers && noRoles
        ? t("create_default_roles_and_add_admin")
        : noUsers
            ? t("add_current_user_as_admin")
            : noRoles ? t("create_default_roles") : undefined;

    return (
        <Paper
            className={"my-4 flex flex-col px-4 py-6 bg-white dark:bg-surface-accent-800 gap-2"}>
            <Typography variant={"subtitle2"} className={"uppercase"}>{t("create_your_users_and_roles")}</Typography>
            <Typography>
                {t("no_users_or_roles_defined")}
            </Typography>
            <Button

                onClick={() => {
                if (!authController.user?.uid) {
                    throw Error("UsersTable, authController misconfiguration");
                }
                if (noUsers) {
                    userManagement.saveUser({
                        uid: authController.user?.uid,
                        email: authController.user?.email,
                        displayName: authController.user?.displayName,
                        photoURL: authController.user?.photoURL,
                        providerId: authController.user?.providerId,
                        isAnonymous: authController.user?.isAnonymous,
                        roles: [{
                            id: "admin",
                            name: "Admin"
                        }],
                        created_on: new Date()
                    })
                        .then(() => {
                            snackbarController.open({
                                type: "success",
                                message: "User added successfully"
                            })
                        })
                        .catch((error) => {
                            snackbarController.open({
                                type: "error",
                                message: "Error adding user: " + error.message
                            })
                        });
                }
                if (noRoles) {
                    DEFAULT_ROLES.forEach((role) => {
                        userManagement.saveRole(role);
                    });
                }
            }}>
                <AddIcon/>
                {buttonLabel}
            </Button>
        </Paper>
    );

}
