import { FireCMSPlugin, useAuthController, useSnackbarController } from "@firecms/core";
import { UserManagementProvider } from "./UserManagementProvider";
import { PersistedUser, UserManagement } from "./types";
import { AddIcon, Button, Paper, Typography } from "@firecms/ui";
import { DEFAULT_ROLES } from "./components/roles/default_roles";

export function useUserManagementPlugin({ userManagement }: {
    userManagement: UserManagement,
}): FireCMSPlugin {

    const noUsers = userManagement.users.length === 0;
    const noRoles = userManagement.roles.length === 0;

    return {
        key: "user_management",
        loading: userManagement.loading,

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
    userManagement: UserManagement<PersistedUser>;
}) {

    const authController = useAuthController();
    const snackbarController = useSnackbarController();

    const buttonLabel = noUsers && noRoles
        ? "Create default roles and add current user as admin"
        : noUsers
            ? "Add current user as admin"
            : noRoles ? "Create default roles" : undefined;

    return (
        <Paper
            className={"my-4 flex flex-col px-4 py-6 bg-white dark:bg-slate-800 gap-2"}>
            <Typography variant={"subtitle2"} className={"uppercase"}>Create your users and roles</Typography>
            <Typography>
                You have no users or roles defined. You can create default roles and add the current user as admin.
            </Typography>
            <Button onClick={() => {
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
