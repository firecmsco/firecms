import { Converter } from "typedoc/dist/lib/converter";
import { DispatcherEvent } from "typedoc/dist/lib/output/events";

export function load(PluginHost: Converter) {
    const app = PluginHost.owner;

    app.converter.on(DispatcherEvent.BEGIN, (context) => {
        const project = context.project;
        Object.keys(project.reflections).forEach((key) => {
            const reflection = project.reflections[key];
            if (!reflection.groups || reflection.groups.length === 0) {
                delete project.reflections[key];
            }
        })
    });
}
