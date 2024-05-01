import { AddIcon, Button, IconButton, Select, SelectGroup, SelectItem, Tooltip, Typography } from "@firecms/ui";

import { useParams } from "react-router-dom";
import { useSaasClientController } from "../SaasApp";
import { useSaasAnalytics } from "./SaasAnalyticsProvider";

export function ProjectsSelect({}: {}) {

    const analytics = useSaasAnalytics();

    const { projectId } = useParams();

    const {
        onNewProject,
        selectProject,
        fireCMSBackend
    } = useSaasClientController();

    const projects = fireCMSBackend.projects;

    if (projects === null || projects === undefined)
        return null;

    return <>

        <Tooltip title={"Create new project"}>
            <IconButton
                variant={"filled"}
                className="p-2 my-4 mx-1 rounded-full"
                onClick={onNewProject}>
                <AddIcon/>
            </IconButton>
        </Tooltip>

        <Select value={projectId ?? "__none__"}
                placeholder={"Projects"}
                size={"small"}
                position={"popper"}
                onValueChange={(projectId) => {
                    analytics.logProjectSelectProjectSelected(projectId);
                    selectProject(projectId);
                }}
                renderValue={(projectId: string) => {
                    if (projectId === "__none__")
                        return <Typography
                            className="text-sm font-semibold">Existing projects</Typography>;
                    const project = (projects ?? []).find(p => p.projectId === projectId);
                    return <Typography
                        className="text-xs font-semibold">{project?.name.toUpperCase()}</Typography>;
                }}>

            {projects && <SelectGroup label={"Your projects"}>
                {projects.map((project) =>
                    <SelectItem
                        key={project.projectId}
                        value={project.projectId}
                        className="text-sm font-medium">
                        {project.name.toUpperCase()}
                    </SelectItem>
                )}
            </SelectGroup>}

            <Button
                variant={"outlined"}
                className="p-2 my-4 mx-1"
                onClick={onNewProject}>
                <AddIcon/>
                Create new project
            </Button>

        </Select>
    </>;
}
