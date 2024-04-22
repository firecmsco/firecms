import { CircularProgressCenter, FireCMSLogo } from "@firecms/core";
import { CenteredView, Paper, Table, TableCell, TableRow, Tooltip, Typography } from "@firecms/ui";

import { FireCMSBackend, useFireCMSBackend } from "@firecms/cloud";
import { useGoogleProjects } from "../hooks/useGoogleProjects";
import { GoogleProject } from "../types/google_projects";
import { FirebaseLogo } from "./utils/logos/FirebaseLogo";

export function ExistingProjectsTable({
                                          fireCMSBackend,
                                          disabled = false,
                                          onProjectClick
                                      }: {
    fireCMSBackend: FireCMSBackend,
    disabled?: boolean,
    onProjectClick: (project: GoogleProject) => void
}) {

    const { backendFirebaseApp } = useFireCMSBackend();

    const {
        googleProjects,
        projectsLoading,
        projectsLoadingError
    } = useGoogleProjects({
        firebaseApp: backendFirebaseApp,
        fireCMSBackend: fireCMSBackend
    });

    const errorView = projectsLoadingError && <Typography
        color={"error"}>
        {projectsLoadingError?.message}
    </Typography>;

    const sortedProjects: GoogleProject[] | undefined = googleProjects?.sort((a, b) => {
        return (b.fireCMSProject ? 1 : 0) - (a.fireCMSProject ? 1 : 0)
    })

    return <div className={"flex flex-col max-h-full"}>
        <Typography className={"my-4 flex-grow uppercase font-medium text-sm"}>Pick your existing project</Typography>
        <Paper
            className="flex-grow bg-inherit overflow-auto h-96 w-full min-w-[600px] max-h-[900px]">

            {projectsLoading && <CircularProgressCenter/>}

            {!projectsLoading && sortedProjects && <Table>
                {sortedProjects.map((project: GoogleProject) => (
                    <TableRow
                        key={project.projectId}
                        onClick={disabled
                            ? undefined
                            : () => {
                                onProjectClick(project);
                            }}
                        className={`cursor-pointer ${disabled ? "opacity-50" : "opacity-100"}`}
                    >
                        <TableCell className="px-1 py-6 flex justify-center space-x-1 w-full">
                            {project.cloudProjectConfigurationStatus.firebaseEnabled &&
                                <Tooltip
                                    title={"This is a Firebase project"}>
                                    <a style={{ height: 20 }}>
                                        <FirebaseLogo
                                            width={"20"}
                                            height={"20"}/>
                                    </a>
                                </Tooltip>}
                            {project.fireCMSProject &&
                                <Tooltip
                                    title={"This project is linked to FireCMS Cloud"}>
                                    <a style={{ height: 20 }}>
                                        <FireCMSLogo
                                            width={"20"}
                                            height={"20"}/>
                                    </a>
                                </Tooltip>}
                        </TableCell>

                        <TableCell className="px-4">
                            <Typography
                                className={"font-medium"}>
                                {project.displayName}
                            </Typography>
                            <Typography variant={"caption"}
                                        color={"secondary"}>

                                {project.projectId}
                            </Typography>
                        </TableCell>
                    </TableRow>
                ))}
            </Table>}

            {!projectsLoading && (!sortedProjects || sortedProjects.length === 0) && !errorView &&
                <CenteredView>
                    <Typography>You have no existing Firebase
                        projects</Typography>
                </CenteredView>
            }

            {!projectsLoading && errorView &&
                <CenteredView>
                    {errorView}
                </CenteredView>
            }

        </Paper>
    </div>;
}
