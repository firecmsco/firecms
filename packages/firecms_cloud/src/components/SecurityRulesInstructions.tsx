import { Paper, Typography } from "@firecms/ui";

export function SecurityRulesInstructions({}: {}) {

    return <>
        <Typography variant={"h4"}>Security rules</Typography>

        <Typography>
            FireCMS uses Firebase security rules to restrict access to data.
            When creating a new user through FireCMS, the custom claim <Typography
            className={"inline-block bg-white dark:bg-surface-950 px-1 rounded-md"}
            component={"pre"}>fireCMSUser</Typography> is added to the user
            in the client project. By adding the following security rules to your project, you
            ensure FireCMS users can access data through FireCMS.
        </Typography>

        <Paper>
            <Typography component={"pre"}
                        className="m-0 p-4 text-sm font-mono">
                {
                    `match /{document=**} {
    allow read, write: if request.auth.token.fireCMSUser;
}`
                }
            </Typography>
        </Paper>
        <Typography variant={"caption"}>
            This rules restrict access to data
            to FireCMS users only, but does <strong>not</strong> enforce the
            permissions at the database level. The permissions are enforced in the frontend though, which will
            work fine for most projects. If you need to enforce the permissions
            at the database level, you can modify these security rules
            yourself to suit your needs.
            The roles assigned to a user are set as a custom claim in the
            Firebase auth token, so you can use them in your security rules.
        </Typography>

    </>

}
